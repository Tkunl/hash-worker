import fs from 'fs'
import path from 'path'
import { getFileSliceLocations, readFileAsArrayBuffer } from '.'
import {
  getArrParts,
  getChunksHashMultiple,
  getChunksHashSingle,
  getMerkleRootHashByChunks,
  mergeConfig,
  WorkerService,
} from '../shared'
import { Config, HashChksParam } from '../types'

export function normalizeParamInNode(param: HashChksParam) {
  if (!param.filePath) {
    throw new Error('The filePath attribute is required in node environment')
  }
  let _filePath = param.filePath
  try {
    if (!path.isAbsolute(_filePath)) {
      _filePath = path.resolve(_filePath)
    }
    const stats = fs.statSync(_filePath)
    if (!stats.isFile()) {
      throw new Error('Invalid filePath: Path does not point to a file')
    }
  } catch (err) {
    const error = err as NodeJS.ErrnoException
    if (error.code === 'ENOENT') {
      throw new Error('Invalid filePath: File does not exist')
    }
    throw err
  }

  return {
    ...param,
    config: mergeConfig(param.config),
  }
}

export async function processFileInNode(
  filePath: string,
  config: Required<Config>,
  workerSvc: WorkerService,
  _getChunksHashSingle = getChunksHashSingle,
  _getChunksHashMultiple = getChunksHashMultiple,
) {
  const { chunkSize, strategy, workerCount, borderCount } = config

  // 文件分片
  const { sliceLocation, endLocation } = await getFileSliceLocations(filePath, chunkSize)
  let chunksHash: string[] = []

  const singleChunkProcessor = async () => {
    const arrayBuffer = await readFileAsArrayBuffer(filePath, 0, endLocation)
    chunksHash = await _getChunksHashSingle(strategy, arrayBuffer)
  }

  const multipleChunksProcessor = async () => {
    let chunksBuf: ArrayBuffer[] = []
    // 分组后的起始分割位置
    const sliceLocationPart = getArrParts<[number, number]>(sliceLocation, workerCount)
    const tasks = sliceLocationPart.map((partArr) => async () => {
      // 手动释放上一次用于计算 Hash 的 ArrayBuffer
      chunksBuf.length = 0
      chunksBuf = await Promise.all(
        partArr.map((part) => readFileAsArrayBuffer(filePath, part[0], part[1])),
      )
      // 执行不同的 hash 计算策略
      return _getChunksHashMultiple(
        strategy,
        chunksBuf,
        sliceLocation.length,
        borderCount,
        workerSvc,
      )
    })

    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
    chunksBuf.length = 0
  }

  sliceLocation.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
  const fileHash = await getMerkleRootHashByChunks(chunksHash)

  return {
    chunksHash,
    fileHash,
  }
}
