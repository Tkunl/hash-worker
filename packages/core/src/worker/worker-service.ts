import { WorkerPoolForMd5 } from './worker-pool-for-md5'
import { WorkerPoolForCrc32 } from './worker-pool-for-crc32'

export class WorkerService {
  MAX_WORKERS

  md5Pool: WorkerPoolForMd5 | undefined
  crc32Pool: WorkerPoolForCrc32 | undefined

  constructor(maxWorkers: number) {
    this.MAX_WORKERS = maxWorkers
  }

  async getMD5ForFiles(chunks: ArrayBuffer[]) {
    if (this.md5Pool === undefined) {
      this.md5Pool = await WorkerPoolForMd5.create(this.MAX_WORKERS)
    }
    return this.md5Pool.exec<string>(chunks)
  }

  async getCRC32ForFiles(chunks: ArrayBuffer[]) {
    if (this.crc32Pool === undefined) {
      this.crc32Pool = await WorkerPoolForCrc32.create(this.MAX_WORKERS)
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
