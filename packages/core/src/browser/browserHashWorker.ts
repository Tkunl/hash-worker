import { getFileMetadataInBrowser, normalizeParamInBrowser, processFileInBrowser } from '.'
import { BaseHashWorker, WorkerService } from '../shared'
import { Config, HashChksParam } from '../types'

class BrowserHashWorker extends BaseHashWorker {
  protected normalizeParams(param: HashChksParam) {
    return <Required<HashChksParam>>normalizeParamInBrowser(param)
  }

  protected processFile({
    file,
    config,
    workerSvc,
  }: {
    file?: File
    config: Required<Config>
    workerSvc: WorkerService
  }) {
    return processFileInBrowser(file!, config, workerSvc)
  }

  protected getFileMetadata({ file }: { file?: File }) {
    return getFileMetadataInBrowser(file!)
  }
}

const instance = new BrowserHashWorker()
export const getFileHashChunks = instance.getFileHashChunks.bind(instance)
export const destroyWorkerPool = instance.destroyWorkerPool.bind(instance)
