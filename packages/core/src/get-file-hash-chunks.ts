import {
  getArrayBufFromBlobs,
  getArrParts,
  getFileMetadata,
  getFileSliceLocations,
  isBrowser,
  isNode,
  readFileAsArrayBuffer,
  sliceFile,
} from './utils'
import { WorkerService } from './worker/worker-service'
import { Config, HashChksParam, HashChksRes } from './interface'
import { getRootHashByChunks } from './get-root-hash-by-chunks'
import { getChunksHashMultiple, getChunksHashSingle, normalizeParam } from './helper'

let workerService: WorkerService | null = null

async function processFileInBrowser(
  file: File,
  config: Required<Config>,
  workerSvc: WorkerService,
) {
  if (!isBrowser()) throw new Error('Error environment')
  const { chunkSize, strategy, workerCount, isCloseWorkerImmediately, borderCount } = config

  // 文件分片
  const chunksBlob = sliceFile(file, chunkSize)
  let chunksHash: string[] = []

  const singleChunkProcessor = async () => {
    const arrayBuffer = await chunksBlob[0].arrayBuffer()
    chunksHash = await getChunksHashSingle(strategy, arrayBuffer)
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
      return getChunksHashMultiple(strategy, chunksBuf, chunksBlob.length, borderCount, workerSvc)
    })

    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
    chunksBuf.length = 0
    isCloseWorkerImmediately && workerSvc.terminate()
  }

  chunksBlob.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
  const fileHash = await getRootHashByChunks(chunksHash)

  return {
    chunksBlob,
    chunksHash,
    fileHash,
  }
}

async function processFileInNode(
  filePath: string,
  config: Required<Config>,
  workerSvc: WorkerService,
) {
  if (!isNode()) throw new Error('Error environment')
  const { chunkSize, strategy, workerCount, isCloseWorkerImmediately, borderCount } = config

  // 文件分片
  const { sliceLocation, endLocation } = await getFileSliceLocations(filePath, chunkSize)
  let chunksHash: string[] = []

  const singleChunkProcessor = async () => {
    const arrayBuffer = await readFileAsArrayBuffer(filePath, 0, endLocation)
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
        partArr.map((part) => readFileAsArrayBuffer(filePath, part[0], part[1])),
      )
      // 执行不同的 hash 计算策略
      return getChunksHashMultiple(
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
    isCloseWorkerImmediately && workerSvc!.terminate()
  }

  sliceLocation.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
  const fileHash = await getRootHashByChunks(chunksHash)

  return {
    chunksHash,
    fileHash,
  }
}

/**
 * 将文件进行分片, 并获取分片后的 hashList
 * @param param
 */
async function getFileHashChunks(param: HashChksParam): Promise<HashChksRes> {
  const { config } = normalizeParam(param)
  workerService === null && (workerService = new WorkerService(config.workerCount))

  // 文件元数据
  const metadata = await getFileMetadata(param.file, param.filePath)

  let chunksBlob: Blob[] = []
  let chunksHash: string[] = []
  let fileHash = ''

  if (isBrowser()) {
    const res = await processFileInBrowser(param.file!, config, workerService)
    chunksBlob = res.chunksBlob
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  if (isNode()) {
    const res = await processFileInNode(param.filePath!, config, workerService)
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  const res: HashChksRes = {
    chunksHash,
    merkleHash: fileHash,
    metadata,
  }

  if (isBrowser()) {
    res.chunksBlob = chunksBlob
  }

  return res
}

function destroyWorkerPool() {
  workerService && workerService.terminate()
}

export { getFileHashChunks, destroyWorkerPool }
