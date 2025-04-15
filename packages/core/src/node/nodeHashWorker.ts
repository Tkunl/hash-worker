import { getFileMetadata, NodeWorkerService, normalizeNodeParam, processFileInNode } from '.'
import { BaseHashWorker, BaseWorkerService } from '../shared'
import { Config, HashChksParam } from '../types'

class NodeWorkerBrowser extends BaseHashWorker {
  protected normalizeParams(param: HashChksParam) {
    return <Required<HashChksParam>>normalizeNodeParam(param)
  }
  protected processFile({
    filePath,
    config,
    workerSvc,
  }: {
    filePath?: string
    config: Required<Config>
    workerSvc: BaseWorkerService
  }) {
    return processFileInNode(filePath!, config, <NodeWorkerService>workerSvc)
  }
  protected createWorkerSvc(workerCount: number): BaseWorkerService {
    return new NodeWorkerService(workerCount)
  }
  protected getFileMetadata({ filePath }: { filePath?: string }) {
    return getFileMetadata(filePath!)
  }
}

const instance = new NodeWorkerBrowser()
export const getFileHashChunks = instance.getFileHashChunks.bind(instance)
export const destroyWorkerPool = instance.destroyWorkerPool.bind(instance)
