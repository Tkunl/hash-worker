import { WorkerService } from './worker/workerService'
import { Config, HashChksParam, Strategy } from './interface'
import {
  getArrayBufFromBlobs,
  getArrParts,
  getFileSliceLocations,
  getHashStrategy,
  isBrowser,
  isNode,
  readFileAsArrayBuffer,
  sliceFile,
} from './utils'
import { getRootHashByChunks } from './getRootHashByChunks'

const DEFAULT_MAX_WORKERS = 8
const BORDER_COUNT = 100

/**
 * 标准化参数
 * @param param
 */
export function normalizeParam(param: HashChksParam) {
  const env: 'node' | 'browser' = (() => {
    if (isNode()) return 'node'
    if (isBrowser()) return 'browser'
    throw new Error('Unsupported environment')
  })()

  const { chunkSize, workerCount, strategy, borderCount, isCloseWorkerImmediately, isShowLog } =
    param.config ?? {}

  const config = {
    // 默认 10MB 分片大小
    chunkSize: chunkSize ?? 10,
    // 默认使用 8个 Worker 线程
    workerCount: workerCount ?? DEFAULT_MAX_WORKERS,
    // 默认使用混合模式计算 hash
    strategy: strategy ?? Strategy.mixed,
    // 默认以 100 分片数量作为边界
    borderCount: borderCount ?? BORDER_COUNT,
    // 默认计算 hash 后立即关闭 worker
    isCloseWorkerImmediately: isCloseWorkerImmediately ?? true,
    // 是否显示速度 log
    isShowLog: isShowLog ?? false,
  }

  if (env === 'node') {
    if (!param.filePath) {
      throw new Error('The filePath attribute is required in node environment')
    }
    return {
      ...param,
      config,
      filePath: param.filePath,
    }
  }

  if (env === 'browser') {
    if (!param.file) {
      throw new Error('The file attribute is required in browser environment')
    }
    return {
      ...param,
      config,
      file: param.file,
    }
  }

  throw new Error('Unsupported environment')
}

/**
 * 计算单个文件分片的 Hash
 * @param strategy hash 策略
 * @param arrayBuffer 文件分片的 arrayBuffer
 */
export async function getChunksHashSingle(strategy: Strategy, arrayBuffer: ArrayBuffer) {
  const unit8Array = new Uint8Array(arrayBuffer)
  return [await getHashStrategy(strategy === Strategy.mixed ? Strategy.md5 : strategy)(unit8Array)]
}

/**
 * 计算多个文件分片的 Hash
 * @param strategy hash 策略
 * @param arrayBuffers 当前文件分片的 arrayBuffer 数组 (组内)
 * @param chunksCount 文件的全部分片数量
 * @param borderCount Strategy.mixed 时的边界个数
 * @param workerSvc WorkerService
 */
export async function getChunksHashMultiple(
  strategy: Strategy,
  arrayBuffers: ArrayBuffer[],
  chunksCount: number,
  borderCount: number,
  workerSvc: WorkerService,
) {
  const processor = {
    [Strategy.xxHash64]: () => workerSvc.getXxHash64ForFiles(arrayBuffers),
    [Strategy.md5]: () => workerSvc.getMD5ForFiles(arrayBuffers),
    [Strategy.crc32]: () => workerSvc.getCRC32ForFiles(arrayBuffers),
    [Strategy.mixed]: () =>
      chunksCount <= borderCount
        ? workerSvc.getMD5ForFiles(arrayBuffers)
        : workerSvc.getCRC32ForFiles(arrayBuffers),
  }

  return processor[strategy]()
}

export async function processFileInBrowser(
  file: File,
  config: Required<Config>,
  workerSvc: WorkerService,
  _getChunksHashSingle = getChunksHashSingle,
  _getChunksHashMultiple = getChunksHashMultiple,
) {
  const { chunkSize, strategy, workerCount, borderCount } = config

  // 文件分片
  const chunksBlob = sliceFile(file, chunkSize)
  let chunksHash: string[] = []

  const singleChunkProcessor = async () => {
    const arrayBuffer = await chunksBlob[0].arrayBuffer()
    chunksHash = await _getChunksHashSingle(strategy, arrayBuffer)
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
      return _getChunksHashMultiple(strategy, chunksBuf, chunksBlob.length, borderCount, workerSvc)
    })

    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
    chunksBuf && (chunksBuf.length = 0)
  }

  chunksBlob.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
  const fileHash = await getRootHashByChunks(chunksHash)

  return {
    chunksBlob,
    chunksHash,
    fileHash,
  }
}

export async function processFileInNode(
  filePath: string,
  config: Required<Config>,
  workerSvc: WorkerService,
  _getChunksHashSingle = getChunksHashSingle,
  _getChunksHashMultiple = getChunksHashMultiple,
) {
  const { chunkSize, strategy, workerCount, borderCount } = config

  // 文件分片
  const { sliceLocation, endLocation } = await getFileSliceLocations(filePath, chunkSize)
  let chunksHash: string[] = []

  const singleChunkProcessor = async () => {
    const arrayBuffer = await readFileAsArrayBuffer(filePath, 0, endLocation)
    chunksHash = await _getChunksHashSingle(strategy, arrayBuffer)
  }

  const multipleChunksProcessor = async () => {
    let chunksBuf: ArrayBuffer[] = []
    // 分组后的起始分割位置
    const sliceLocationPart = getArrParts<[number, number]>(sliceLocation, workerCount)
    const tasks = sliceLocationPart.map((partArr) => async () => {
      // 手动释放上一次用于计算 Hash 的 ArrayBuffer
      chunksBuf.length = 0
      chunksBuf = await Promise.all(
        partArr.map((part) => readFileAsArrayBuffer(filePath, part[0], part[1])),
      )
      // 执行不同的 hash 计算策略
      return _getChunksHashMultiple(
        strategy,
        chunksBuf,
        sliceLocation.length,
        borderCount,
        workerSvc,
      )
    })

    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
    chunksBuf.length = 0
  }

  sliceLocation.length === 1 ? await singleChunkProcessor() : await multipleChunksProcessor()
  const fileHash = await getRootHashByChunks(chunksHash)

  return {
    chunksHash,
    fileHash,
  }
}
