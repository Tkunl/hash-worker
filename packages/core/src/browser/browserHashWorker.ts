import { BrowserWorkerPool, getArrayBufFromBlobs, getFileMetadataInBrowser, sliceFile } from '.'
import {
  BaseHashWorker,
  getArrParts,
  getChunksHashMultipleStrategy,
  getChunksHashSingle,
  getMerkleRootHashByChunks,
  mergeConfig,
  runAsyncFuncSerialized,
  WorkerService,
} from '../shared'
import { Config, HashChksParam, RequiredWithExclude } from '../types'

class BrowserHashWorker extends BaseHashWorker {
  protected createWorkerService(workerCount: number): WorkerService {
    return new WorkerService(workerCount, new BrowserWorkerPool(workerCount))
  }

  protected normalizeParams(param: HashChksParam) {
    if (!param.file) {
      throw new Error('The file attribute is required in browser environment')
    }

    return <Required<HashChksParam>>{
      ...param,
      config: mergeConfig(param.config),
    }
  }

  protected async processFile({
    file,
    config,
  }: {
    file?: File
    config: RequiredWithExclude<Config, 'hashFn'>
  }) {
    const _file = file!
    const { chunkSize, strategy, workerCount, borderCount, hashFn, timeout } = config

    const chunksBlob = sliceFile(_file, chunkSize)
    let chunksHash: string[] = []

    const singleChunkProcessor = async () => {
      const arrayBuffer = await chunksBlob[0].arrayBuffer()
      chunksHash = await getChunksHashSingle(strategy, arrayBuffer)
    }

    const multipleChunksProcessor = async () => {
      let chunksBuf: ArrayBuffer[] = []
      // 将文件分片进行分组, 组内任务并行执行, 组外任务串行执行
      const chunksPart = getArrParts<Blob>(chunksBlob, workerCount)
      const tasks = chunksPart.map((part) => async () => {
        // 手动释放上一次用于计算 Hash 的 ArrayBuffer
        chunksBuf.length = 0
        chunksBuf = await getArrayBufFromBlobs(part)
        // 执行不同的 hash 计算策略
        const _strategy = getChunksHashMultipleStrategy(strategy, chunksBlob.length, borderCount)

        // 传递超时配置给 getHashForFiles
        const taskConfig = timeout ? { timeout } : undefined
        return this.workerService!.getHashForFiles(chunksBuf, _strategy, taskConfig)
      })

      chunksHash = await runAsyncFuncSerialized<string>(tasks)
      chunksBuf.length = 0
    }

    chunksBlob.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
    const fileHash = await getMerkleRootHashByChunks(chunksHash, hashFn)

    return {
      chunksBlob,
      chunksHash,
      fileHash,
    }
  }

  protected getFileMetadata({ file }: { file?: File }) {
    return getFileMetadataInBrowser(file!)
  }
}

const instance = new BrowserHashWorker()
export const getFileHashChunks = instance.getFileHashChunks.bind(instance)
export const destroyWorkerPool = instance.destroyWorkerPool.bind(instance)
