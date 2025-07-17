import { WorkerService } from './workerService'
import { Config, FileMetaInfo, HashChksParam, HashChksRes } from '../types'

type ProcessFileProps = {
  file?: File
  filePath?: string
  config: Required<Config>
}

type ProcessFileResult = Promise<{ chunksBlob?: Blob[]; chunksHash: string[]; fileHash: string }>

type GetFileMetadataProps = {
  file?: File
  filePath?: string
}

export abstract class BaseHashWorker {
  protected workerService: WorkerService | null = null
  protected curWorkerCount: number = 0

  protected abstract normalizeParams(param: HashChksParam): Required<HashChksParam>
  protected abstract processFile({ file, filePath, config }: ProcessFileProps): ProcessFileResult
  protected abstract getFileMetadata({
    file,
    filePath,
  }: GetFileMetadataProps): Promise<FileMetaInfo>
  protected abstract createWorkerService(workerCount: number): WorkerService

  async getFileHashChunks(param: HashChksParam): Promise<HashChksRes> {
    const { config, file, filePath } = this.normalizeParams(param)
    const requiredConfig = config as Required<Config>
    const { isCloseWorkerImmediately, isShowLog, workerCount } = requiredConfig
    if (this.workerService === null) {
      this.workerService = this.createWorkerService(workerCount)
      this.curWorkerCount = workerCount
    }
    if (this.curWorkerCount !== workerCount) {
      this.workerService.adjustWorkerPoolSize(workerCount)
      this.curWorkerCount = workerCount
    }
    const metadata = await this.getFileMetadata({ file, filePath })

    let beforeTime: number = 0
    let overTime: number = 0
    isShowLog && (beforeTime = Date.now())
    const fileInfo = await this.processFile({
      file,
      filePath,
      config: requiredConfig,
    })
    isShowLog && (overTime = Date.now() - beforeTime)
    isShowLog &&
      console.log(
        `get file hash in: ${overTime} ms by using ${config.workerCount} worker, speed: ${(metadata.size / 1024 / (overTime / 1000)).toFixed(2)} MB/s`,
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
