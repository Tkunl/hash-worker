import { BaseWorkerService } from './shared'
import { Config, FileMetaInfo, HashChksParam, HashChksRes } from './types'

export abstract class HashWorker {
  protected workerService: any = null
  protected curWorkerCount: number = 0

  protected abstract normalizeParams(param: HashChksParam): Required<HashChksParam>
  protected abstract processFile({
    file,
    filePath,
    config,
    workerSvc,
  }: {
    file?: File
    filePath?: string
    config: Required<Config>
    workerSvc: BaseWorkerService
  }): Promise<{ chunksBlob?: Blob[]; chunksHash: string[]; fileHash: string }>
  protected abstract createWorkerSvc(workerCount: number): BaseWorkerService
  protected abstract getFileMetadata({
    file,
    filePath,
  }: {
    file?: File
    filePath?: string
  }): Promise<FileMetaInfo>

  async getFileHashChunks(param: HashChksParam): Promise<HashChksRes> {
    const { config, file, filePath } = this.normalizeParams(param)
    const requiredConfig = config as Required<Config>
    const { isCloseWorkerImmediately, isShowLog, workerCount } = requiredConfig
    if (this.workerService === null || this.curWorkerCount !== workerCount) {
      this.destroyWorkerPool()
      this.workerService = this.createWorkerSvc(workerCount)
    }
    const metadata = await this.getFileMetadata({ file, filePath })

    let beforeTime: number = 0
    let overTime: number = 0
    isShowLog && (beforeTime = Date.now())
    const fileInfo = await this.processFile({
      file,
      filePath,
      config: requiredConfig,
      workerSvc: this.workerService,
    })
    isShowLog && (overTime = Date.now() - beforeTime)
    isShowLog &&
      console.log(
        `get file hash in: ${overTime} ms by using ${config.workerCount} worker, speed: ${metadata.size / 1024 / (overTime / 1000)} Mb/s`,
      )
    isCloseWorkerImmediately && this.destroyWorkerPool()

    return {
      chunksBlob: fileInfo.chunksBlob,
      chunksHash: fileInfo.chunksHash,
      merkleHash: fileInfo.fileHash,
      metadata,
    }
  }

  destroyWorkerPool() {
    this.workerService && this.workerService.terminate()
    this.workerService = null
    this.curWorkerCount = 0
  }
}
