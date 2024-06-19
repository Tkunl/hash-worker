import { WorkerPoolForMd5s } from './worker-pool-for-md5s'
import { WorkerPoolForCrc32s } from './worker-pool-for-crc32s'

export class WorkerService {
  MAX_WORKERS

  md5Pool: WorkerPoolForMd5s | undefined
  crc32Pool: WorkerPoolForCrc32s | undefined

  constructor(maxWorkers: number) {
    this.MAX_WORKERS = maxWorkers
  }

  /**
   * 直接计算文件的 MD5
   * @param chunks 将每个 chunk 视作独立的文件
   */
  async getMD5ForFiles(chunks: ArrayBuffer[]) {
    if (this.md5Pool === undefined) {
      this.md5Pool = await WorkerPoolForMd5s.create(this.MAX_WORKERS)
    }
    return this.md5Pool.exec<string>(chunks)
  }

  /**
   * 直接计算文件的 CRC32
   * @param chunks 将每个 chunk 视作独立的文件
   */
  async getCRC32ForFiles(chunks: ArrayBuffer[]) {
    if (this.crc32Pool === undefined) {
      this.crc32Pool = await WorkerPoolForCrc32s.create(this.MAX_WORKERS)
    }
    return this.crc32Pool.exec<string>(chunks)
  }

  terminate() {
    this.md5Pool && this.md5Pool.terminate()
    this.crc32Pool && this.crc32Pool.terminate()
    this.md5Pool = undefined
    this.crc32Pool = undefined
  }
}
