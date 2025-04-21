import fs from 'fs'
import path from 'path'
import { getFileMetadata, getFileSliceLocations, NodeWorkerPool, readFileAsArrayBuffer } from '.'
import {
  BaseHashWorker,
  getArrParts,
  getChunksHashMultipleStrategy,
  getChunksHashSingle,
  getMerkleRootHashByChunks,
  mergeConfig,
  runAsyncFuncSerialized,
  WorkerService,
} from '../shared'
import { Config, HashChksParam } from '../types'

class NodeHashWorker extends BaseHashWorker {
  protected createWorkerService(workerCount: number): WorkerService {
    return new WorkerService(workerCount, new NodeWorkerPool(workerCount))
  }

  protected normalizeParams(param: HashChksParam) {
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
    return <Required<HashChksParam>>{
      ...param,
      config: mergeConfig(param.config),
    }
  }

  protected async processFile({
    filePath,
    config,
  }: {
    filePath?: string
    config: Required<Config>
  }) {
    const { chunkSize, strategy, workerCount, borderCount, hashFn } = config
    const _filePath = filePath!

    // 文件分片
    const { sliceLocation, endLocation } = await getFileSliceLocations(_filePath, chunkSize)
    let chunksHash: string[] = []

    const singleChunkProcessor = async () => {
      const arrayBuffer = await readFileAsArrayBuffer(_filePath, 0, endLocation)
      chunksHash = await getChunksHashSingle(strategy, arrayBuffer)
    }

    const multipleChunksProcessor = async () => {
      let chunksBuf: ArrayBuffer[] = []
      // 分组后的起始分割位置
      const sliceLocationPart = getArrParts<[number, number]>(sliceLocation, workerCount)
      const tasks = sliceLocationPart.map((partArr) => async () => {
        // 手动释放上一次用于计算 Hash 的 ArrayBuffer
        chunksBuf.length = 0
        chunksBuf = await Promise.all(
          partArr.map((part) => readFileAsArrayBuffer(_filePath, part[0], part[1])),
        )
        // 执行不同的 hash 计算策略
        const _strategy = getChunksHashMultipleStrategy(strategy, sliceLocation.length, borderCount)
        return this.workerService!.getHashForFiles(chunksBuf, _strategy)
      })

      chunksHash = await runAsyncFuncSerialized<string>(tasks)
      chunksBuf.length = 0
    }

    sliceLocation.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
    const fileHash = await getMerkleRootHashByChunks(chunksHash, hashFn)

    return {
      chunksHash,
      fileHash,
    }
  }

  protected getFileMetadata({ filePath }: { filePath?: string }) {
    return getFileMetadata(filePath!)
  }
}

const instance = new NodeHashWorker()
export const getFileHashChunks = instance.getFileHashChunks.bind(instance)
export const destroyWorkerPool = instance.destroyWorkerPool.bind(instance)
