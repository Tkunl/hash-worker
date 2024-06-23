import { getFileMetadata, isBrowser, isNode } from './utils'
import { WorkerService } from './worker/worker-service'
import { HashChksParam, HashChksRes } from './interface'
import { normalizeParam, processFileInBrowser, processFileInNode } from './helper'

let workerService: WorkerService | null = null

/**
 * 将文件进行分片, 并获取分片后的 hashList
 * @param param
 */
async function getFileHashChunks(param: HashChksParam): Promise<HashChksRes> {
  const { config, file, filePath } = normalizeParam(param)
  workerService === null && (workerService = new WorkerService(config.workerCount))

  // 文件元数据
  const metadata = await getFileMetadata(file, filePath)

  let chunksBlob: Blob[] = []
  let chunksHash: string[] = []
  let fileHash = ''

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
