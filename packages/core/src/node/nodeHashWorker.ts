import { getFileMetadata, normalizeParamInNode, processFileInNode } from '.'
import { BaseHashWorker, WorkerService } from '../shared'
import { Config, HashChksParam } from '../types'

class NodeHashWorker extends BaseHashWorker {
  protected normalizeParams(param: HashChksParam) {
    return <Required<HashChksParam>>normalizeParamInNode(param)
  }

  protected processFile({
    filePath,
    config,
    workerSvc,
  }: {
    filePath?: string
    config: Required<Config>
    workerSvc: WorkerService
  }) {
    return processFileInNode(filePath!, config, workerSvc)
  }

  protected getFileMetadata({ filePath }: { filePath?: string }) {
    return getFileMetadata(filePath!)
  }
}

const instance = new NodeHashWorker()
export const getFileHashChunks = instance.getFileHashChunks.bind(instance)
export const destroyWorkerPool = instance.destroyWorkerPool.bind(instance)
