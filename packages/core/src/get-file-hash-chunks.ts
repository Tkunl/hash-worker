import { getFileMetadata, isBrowser, isNode } from './utils'
import { WorkerService } from './worker/worker-service'
import { HashChksParam, HashChksRes } from './interface'
import { normalizeParam, processFileInBrowser, processFileInNode } from './helper'

let workerService: WorkerService | null = null
let curWorkerCount: number = 0

/**
 * 将文件进行分片, 并获取分片后的 hashList
 * @param param
 */
async function getFileHashChunks(param: HashChksParam): Promise<HashChksRes> {
  const { config, file, filePath } = normalizeParam(param)
  const { isCloseWorkerImmediately, isShowLog, workerCount } = config

  if (workerService === null || curWorkerCount !== workerCount) {
    destroyWorkerPool()
    workerService = new WorkerService(config.workerCount)
  }

  const metadata = await getFileMetadata(file, filePath)

  let chunksBlob: Blob[] = []
  let chunksHash: string[] = []
  let fileHash = ''

  let beforeTime: number = 0
  let overTime: number = 0

  isShowLog && (beforeTime = Date.now())

  if (isBrowser() && file) {
    const res = await processFileInBrowser(file, config, workerService)
    chunksBlob = res.chunksBlob
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  if (isNode() && filePath) {
    const res = await processFileInNode(filePath, config, workerService)
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  isShowLog && (overTime = Date.now() - beforeTime)
  isShowLog &&
    console.log(
      `get file hash in: ${overTime} ms by using ${config.workerCount} worker, speed: ${metadata.size / 1024 / (overTime / 1000)} Mb/s`,
    )

  const res: HashChksRes = {
    chunksHash,
    merkleHash: fileHash,
    metadata,
  }

  if (isBrowser()) {
    res.chunksBlob = chunksBlob
  }

  isCloseWorkerImmediately && destroyWorkerPool()
  return res
}

function destroyWorkerPool() {
  workerService && workerService.terminate()
  workerService = null
  curWorkerCount = 0
}

export { getFileHashChunks, destroyWorkerPool }
