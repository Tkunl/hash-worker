import {
  BrowserWorkerService,
  getFileMetadata,
  normalizeBrowserParam,
  processFileInBrowser,
} from './browser'
import { HashWorker } from './hashWorker'
import { BaseWorkerService } from './shared'
import { HashChksParam, Config, FileMetaInfo } from './types'

class HashWorkerBrowser extends HashWorker {
  protected normalizeParams(param: HashChksParam) {
    return <Required<HashChksParam>>normalizeBrowserParam(param)
  }

  protected processFile({
    file,
    config,
    workerSvc,
  }: {
    file?: File
    config: Required<Config>
    workerSvc: BaseWorkerService
  }): Promise<{ chunksBlob?: Blob[]; chunksHash: string[]; fileHash: string }> {
    return processFileInBrowser(file!, config, <BrowserWorkerService>workerSvc)
  }

  protected createWorkerSvc(workerCount: number): BaseWorkerService {
    return new BrowserWorkerService(workerCount)
  }

  protected getFileMetadata({ file }: { file?: File }): Promise<FileMetaInfo> {
    return getFileMetadata(file!)
  }
}

const instance = new HashWorkerBrowser()
export const getFileHashChunks = instance.getFileHashChunks.bind(instance)
export const destroyWorkerPool = instance.destroyWorkerPool.bind(instance)
