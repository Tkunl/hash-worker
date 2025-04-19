import { getArrayBufFromBlobs, sliceFile } from '.'
import {
  getArrParts,
  getChunksHashMultiple,
  getChunksHashSingle,
  getMerkleRootHashByChunks,
  mergeConfig,
  WorkerService,
} from '../shared'
import { Config, HashChksParam } from '../types'

export function normalizeParamInBrowser(param: HashChksParam) {
  if (!param.file) {
    throw new Error('The file attribute is required in browser environment')
  }

  return {
    ...param,
    config: mergeConfig(param.config),
  }
}

export async function processFileInBrowser(
  file: File,
  config: Required<Config>,
  workerSvc: WorkerService,
  _getChunksHashSingle = getChunksHashSingle,
  _getChunksHashMultiple = getChunksHashMultiple,
) {
  const { chunkSize, strategy, workerCount, borderCount } = config

  const chunksBlob = sliceFile(file, chunkSize)
  let chunksHash: string[] = []

  const singleChunkProcessor = async () => {
    const arrayBuffer = await chunksBlob[0].arrayBuffer()
    chunksHash = await _getChunksHashSingle(strategy, arrayBuffer)
  }

  const multipleChunksProcessor = async () => {
    let chunksBuf: ArrayBuffer[] = []
    // 将文件分片进行分组, 组内任务并行执行, 组外任务串行执行
    const chunksPart = getArrParts<Blob>(chunksBlob, workerCount)
    const tasks = chunksPart.map((part) => async () => {
      // 手动释放上一次用于计算 Hash 的 ArrayBuffer
      chunksBuf.length = 0
      chunksBuf = await getArrayBufFromBlobs(part)
      // 执行不同的 hash 计算策略
      return _getChunksHashMultiple(strategy, chunksBuf, chunksBlob.length, borderCount, workerSvc)
    })

    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
    chunksBuf && (chunksBuf.length = 0)
  }

  chunksBlob.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
  const fileHash = await getMerkleRootHashByChunks(chunksHash)

  return {
    chunksBlob,
    chunksHash,
    fileHash,
  }
}
