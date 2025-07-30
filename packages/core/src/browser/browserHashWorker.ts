import {
  BaseHashWorker,
  getArrParts,
  getChunksHashSingle,
  getMerkleRootHashByChunks,
  mergeConfig,
  runAsyncFuncSerialized,
  WorkerService,
} from '../shared'
import { Config, HashWorkerOptions, RequiredWithExclude } from '../types'
import { getArrayBufFromBlobs, getFileMetadataInBrowser, sliceFile } from './browserUtils'
import { BrowserWorkerPool } from './browserWorkerPool'

class BrowserHashWorker extends BaseHashWorker {
  protected createWorkerService(workerCount: number): WorkerService {
    return new WorkerService(new BrowserWorkerPool(workerCount))
  }

  protected normalizeParams(param: HashWorkerOptions) {
    if (!param.file) {
      throw new Error('The file attribute is required in browser environment')
    }

    return <Required<HashWorkerOptions>>{
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
    const { chunkSize, strategy, workerCount, hashFn, timeout } = config

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
        // 传递超时配置给 getHashForFiles
        const taskConfig = timeout ? { timeout } : undefined
        return this.workerService!.getHashForFiles(chunksBuf, strategy, taskConfig)
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
