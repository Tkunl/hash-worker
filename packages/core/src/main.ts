import { getArrayBufFromBlobs, getArrParts, sliceFile } from './utils'
import { md5 } from 'hash-wasm'
import { WorkerService } from './worker/worker-service'
import { MerkleTree } from './entity/merkle-tree'

interface IMetaData {
  name: string
  size: number
  lastModified: number
  type: string
}

let workerService: WorkerService | null = null
const defaultMaxWorkers = 8

/**
 * @param file 待计算 Hash 的文件
 * @param chunkSize 分片大小 MB
 * @param maxWorkers worker 线程数量
 */
async function getFileHashInfo(file: File, chunkSize = 10, maxWorkers = defaultMaxWorkers) {
  if (workerService === null) {
    workerService = new WorkerService(maxWorkers)
  }

  // 分片数量小于 borderCount 用 MD5, 否则用 CRC32 算 Hash
  const BORDER_COUNT = 100

  // 文件大小
  const fileSize = file.size / 1000

  // 文件元数据
  const metadata: IMetaData = {
    name: file.name,
    size: fileSize,
    lastModified: file.lastModified,
    type: file.type,
  }

  // 文件分片
  const chunksBlob = sliceFile(file, chunkSize)
  let chunksHash: string[] = []
  if (chunksBlob.length === 1) {
    chunksHash = [await md5(new Uint8Array(await chunksBlob[0].arrayBuffer()))]
  } else {
    let chunksBuf: ArrayBuffer[] = []
    // 将文件分片进行分组, 组内任务并行执行, 组外任务串行执行
    const chunksPart = getArrParts<Blob>(chunksBlob, defaultMaxWorkers)
    console.log('chunksBlob', chunksBlob.length)
    console.log('BORDER_COUNT', BORDER_COUNT)
    const tasks = chunksPart.map((part) => async () => {
      // 手动释放上一次用于计算 Hash 的 ArrayBuffer
      // !!! 现在只会占用 MAX_WORKERS * 分片数量大小的内存 !!!
      chunksBuf.length = 0
      chunksBuf = await getArrayBufFromBlobs(part)
      // 按文件分片数量执行不同 Hash 策略
      return chunksBlob.length <= BORDER_COUNT
        ? await workerService!.getMD5ForFiles(chunksBuf)
        : await workerService!.getCRC32ForFiles(chunksBuf)
    })
    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
  }

  const merkleTree = new MerkleTree()
  await merkleTree.init(chunksHash)
  const fileHash = merkleTree.getRootHash()

  return {
    chunksBlob,
    chunksHash,
    merkleHash: fileHash,
    metadata,
  }
}

export { getFileHashInfo }
