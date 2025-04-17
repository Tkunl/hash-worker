import {
  BrowserWorkerService,
  getFileMetadata,
  normalizeBrowserParam,
  processFileInBrowser,
} from '.'
import { BaseHashWorker } from '../shared'
import { Config, HashChksParam } from '../types'

class BrowserHashWorker extends BaseHashWorker {
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
    workerSvc: BrowserWorkerService
  }) {
    return processFileInBrowser(file!, config, workerSvc)
  }

  protected createWorkerSvc(workerCount: number) {
    return new BrowserWorkerService(workerCount)
  }

  protected getFileMetadata({ file }: { file?: File }) {
    return getFileMetadata(file!)
  }
}

const instance = new BrowserHashWorker()
export const getFileHashChunks = instance.getFileHashChunks.bind(instance)
export const destroyWorkerPool = instance.destroyWorkerPool.bind(instance)
