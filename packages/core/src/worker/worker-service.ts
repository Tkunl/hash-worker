import { WorkerPoolForMd5s } from './worker-pool-for-md5s'
import { WorkerPoolForCrc32s } from './worker-pool-for-crc32s'

export class WorkerService {
  MAX_WORKERS

  md5SingleWorkerPool: WorkerPoolForMd5s | undefined
  crc32SingleWorkerPool: WorkerPoolForCrc32s | undefined

  constructor(maxWorkers: number) {
    this.MAX_WORKERS = maxWorkers
  }

  /**
   * 直接计算文件的 MD5
   * @param chunks 将每个 chunk 视作独立的文件
   */
  getMD5ForFiles(chunks: ArrayBuffer[]) {
    if (this.md5SingleWorkerPool === undefined) {
      this.md5SingleWorkerPool = new WorkerPoolForMd5s(this.MAX_WORKERS)
    }
    return this.md5SingleWorkerPool.exec<string>(chunks)
  }

  /**
   * 直接计算文件的 CRC32
   * @param chunks 将每个 chunk 视作独立的文件
   */
  getCRC32ForFiles(chunks: ArrayBuffer[]) {
    if (this.crc32SingleWorkerPool === undefined) {
      this.crc32SingleWorkerPool = new WorkerPoolForCrc32s(this.MAX_WORKERS)
    }
    return this.crc32SingleWorkerPool.exec<string>(chunks)
  }

  terminate() {
    this.md5SingleWorkerPool && this.md5SingleWorkerPool.terminate()
    this.crc32SingleWorkerPool && this.crc32SingleWorkerPool.terminate()
    this.md5SingleWorkerPool = undefined
    this.crc32SingleWorkerPool = undefined
  }
}
