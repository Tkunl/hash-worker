import { getArrayBufFromBlobs, getArrParts, MiniSubject, sliceFile } from './utils'
import { md5 } from 'hash-wasm'
import { WorkerService } from './worker/worker-service'
import { MerkleTree } from './entity/merkle-tree'

interface IMetaData {
  size: number,
  lastModified: number,
  type: string
}

let workerService: WorkerService | null = null
let defaultMaxWorkers = 8

async function upload(
  file: File,
  chunkSize: number,
  curStatus: MiniSubject<string>,
  cb: (progress: number) => void,
  maxWorkers = defaultMaxWorkers
) {
  if (workerService === null) {
    workerService = new WorkerService(maxWorkers)
  }

  // 分片数量小于 borderCount 用 MD5, 否则用 CRC32 算 Hash
  const BORDER_COUNT = 100

  // 文件大小
  const fileSize = file.size / 1000

  // 文件元数据
  const metadata: IMetaData = {
    size: file.size,
    lastModified: file.lastModified,
    type: file.type,
  }

  // 文件分片
  curStatus.next('Parsing file ...')
  const chunksBlob = sliceFile(file, chunkSize)
  let chunksHash: string[] = []
  if (chunksBlob.length === 1) {
    chunksHash = [ await md5(new Uint8Array(await chunksBlob[0].arrayBuffer())) ]
  } else {
    let chunksBuf: ArrayBuffer[] = []
    // 将文件分片进行分组, 组内任务并行执行, 组外任务串行执行
    const chunksPart = getArrParts<Blob>(chunksBlob, defaultMaxWorkers)
    const tasks = chunksPart.map(
      (part) => async () => {
        // 手动释放上一次用于计算 Hash 的 ArrayBuffer
        // !!! 现在只会占用 MAX_WORKERS * 分片数量大小的内存 !!!
        chunksBuf.length = 0
        chunksBuf = await getArrayBufFromBlobs(part)
        // 按文件分片数量执行不同 Hash 策略
        return chunksBlob.length <= BORDER_COUNT ?
          await workerService!.getMD5ForFiles(chunksBuf) :
          await workerService!.getCRC32ForFiles(chunksBuf)
      },
    )
    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
  }

  const merkleTree = new MerkleTree()
  await merkleTree.init(chunksHash)
  const fileHash = merkleTree.getRootHash()

}

export { upload }
