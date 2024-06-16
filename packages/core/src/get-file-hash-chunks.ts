import {
  getArrayBufFromBlobs,
  getArrParts,
  getFileSliceLocations,
  isBrowser,
  isEmpty,
  isNode,
  readFileAsArrayBuffer,
  sliceFile,
} from './utils'
import { crc32, md5 } from 'hash-wasm'
import { WorkerService } from './worker/worker-service'
import {
  BrowserHashChksParam,
  Config,
  FileMetaInfo,
  HashChksParam,
  HashChksRes,
  NodeHashChksParam,
} from './interface'
import { Strategy } from './enum'
import { getRootHashByChunks } from './get-root-hash-by-chunks'

const DEFAULT_MAX_WORKERS = 8
const BORDER_COUNT = 100

const isNodeEnv = isNode()
const isBrowserEnv = isBrowser()

let workerService: WorkerService | null = null

let fsp: typeof import('node:fs/promises') | undefined
let path: typeof import('node:path') | undefined

/**
 * 初始化导入
 */
async function initialize(maxWorkerCount: number) {
  if (isNodeEnv) {
    fsp = await import('fs/promises')
    path = await import('path')
  }

  if (workerService === null) {
    workerService = new WorkerService(maxWorkerCount)
  }
}

/**
 * 标准化参数
 * @param param
 */
function normalizeParam(param: HashChksParam) {
  if (isNodeEnv && !param.filePath) {
    throw new Error('The url attribute is required in node environment')
  }

  if (isBrowserEnv && !param.file) {
    throw new Error('The file attribute is required in browser environment')
  }

  /**
   * Ts 编译器无法从 isEmpty 的调用结果自动推断出后续的变量类型, Ts 在类型层面不具备执行时判断函数逻辑的能力
   * 可以通过 明确地检查 undefined 或 使用 ! 或 使用类型断言来处理
   * 此处使用了 !
   */
  const normalizedParam = <HashChksParam>{
    file: param.file,
    url: param.filePath,
  }

  const { chunkSize, workerCount, strategy, borderCount, isCloseWorkerImmediately } =
    param.config ?? {}
  normalizedParam.config = {
    // 默认 10MB 分片大小
    chunkSize: isEmpty(chunkSize) ? 10 : chunkSize!,
    // 默认使用 8个 Worker 线程
    workerCount: isEmpty(workerCount) ? DEFAULT_MAX_WORKERS : workerCount!,
    // 默认使用混合模式计算 hash
    strategy: isEmpty(strategy) ? Strategy.mixed : strategy!,
    // 默认以 100 分片数量作为边界
    borderCount: isEmpty(borderCount) ? BORDER_COUNT : borderCount!,
    // 默认计算 hash 后立即关闭 worker
    isCloseWorkerImmediately: isEmpty(isCloseWorkerImmediately) ? true : isCloseWorkerImmediately,
  }

  if (isNodeEnv) {
    return normalizedParam as NodeHashChksParam
  }

  if (isBrowserEnv) {
    return normalizedParam as BrowserHashChksParam
  }

  throw new Error('Unsupported environment')
}

/**
 * 获取文件元数据
 * @param file 文件
 * @param filePath 文件路径
 */
async function getFileMetadata(file?: File, filePath?: string): Promise<FileMetaInfo> {
  if (file && isBrowserEnv) {
    let fileType: string | undefined = ''

    if (file.name.includes('.')) {
      fileType = file.name.split('.').pop()
      fileType = fileType !== void 0 ? '.' + fileType : ''
    }

    return {
      name: file.name,
      size: file.size / 1024,
      lastModified: file.lastModified,
      type: fileType,
    }
  }
  if (filePath && isNodeEnv && fsp && path) {
    const stats = await fsp.stat(filePath)
    return {
      name: path.basename(filePath),
      size: stats.size / 1024,
      lastModified: stats.mtime.getTime(),
      type: path.extname(filePath),
    }
  }
  throw new Error('Unsupported environment')
}

async function processFileInBrowser(file: File, config: Required<Config>) {
  if (!isBrowserEnv) throw new Error('Error environment')
  const { chunkSize, strategy, workerCount, isCloseWorkerImmediately, borderCount } = config

  // 文件分片
  const chunksBlob = sliceFile(file, chunkSize)
  let chunksHash: string[] = []

  if (chunksBlob.length === 1) {
    const unit8Array = new Uint8Array(await chunksBlob[0].arrayBuffer())
    chunksHash =
      strategy === Strategy.md5 || strategy === Strategy.mixed
        ? [await md5(unit8Array)]
        : [await crc32(unit8Array)]
  } else {
    let chunksBuf: ArrayBuffer[] = []
    // 将文件分片进行分组, 组内任务并行执行, 组外任务串行执行
    const chunksPart = getArrParts<Blob>(chunksBlob, workerCount)
    const tasks = chunksPart.map((part) => async () => {
      // 手动释放上一次用于计算 Hash 的 ArrayBuffer
      // 现在只会占用 MAX_WORKERS * 分片数量大小的内存
      chunksBuf.length = 0
      chunksBuf = await getArrayBufFromBlobs(part)
      // 执行不同的 hash 计算策略
      if (strategy === Strategy.md5) {
        return workerService!.getMD5ForFiles(chunksBuf)
      }
      if (strategy === Strategy.crc32) {
        return workerService!.getCRC32ForFiles(chunksBuf)
      } else {
        return chunksBlob.length <= borderCount
          ? workerService!.getMD5ForFiles(chunksBuf)
          : workerService!.getCRC32ForFiles(chunksBuf)
      }
    })
    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
    isCloseWorkerImmediately && workerService!.terminate()
  }

  const fileHash = await getRootHashByChunks(chunksHash)

  return {
    chunksBlob,
    chunksHash,
    fileHash,
  }
}

async function processFileInNode(filePath: string, config: Required<Config>) {
  if (!isNodeEnv || !fsp) throw new Error('Error environment')
  const { chunkSize, strategy, workerCount, isCloseWorkerImmediately, borderCount } = config

  // 文件分片
  const { sliceLocation, endLocation } = await getFileSliceLocations(filePath, chunkSize)
  let chunksHash: string[] = []

  if (sliceLocation.length === 1) {
    const unit8Array = new Uint8Array(await readFileAsArrayBuffer(filePath, 0, endLocation))
    chunksHash =
      strategy === Strategy.md5 || strategy === Strategy.mixed
        ? [await md5(unit8Array)]
        : [await crc32(unit8Array)]
  } else {
    // 分组后的起始分割位置
    let chunksBuf: ArrayBuffer[] = []
    const sliceLocationPart = getArrParts<[number, number]>(sliceLocation, workerCount)
    const tasks = sliceLocationPart.map((partArr) => async () => {
      chunksBuf.length = 0
      chunksBuf = await Promise.all(
        partArr.map((part) => readFileAsArrayBuffer(filePath, part[0], part[1])),
      )
      // 执行不同的 hash 计算策略
      if (strategy === Strategy.md5) {
        return workerService!.getMD5ForFiles(chunksBuf)
      }
      if (strategy === Strategy.crc32) {
        return workerService!.getCRC32ForFiles(chunksBuf)
      } else {
        return sliceLocation.length <= borderCount
          ? workerService!.getMD5ForFiles(chunksBuf)
          : workerService!.getCRC32ForFiles(chunksBuf)
      }
    })
    for (const task of tasks) {
      const result = await task()
      chunksHash.push(...result)
    }
    isCloseWorkerImmediately && workerService!.terminate()
  }

  const fileHash = await getRootHashByChunks(chunksHash)

  return {
    chunksHash,
    fileHash,
  }
}

/**
 * 将文件进行分片, 并获取分片后的 hashList
 * @param param
 */
async function getFileHashChunks(param: HashChksParam): Promise<HashChksRes> {
  const { config } = normalizeParam(param)

  await initialize(config.workerCount)

  // 文件元数据
  const metadata = await getFileMetadata(param.file, param.filePath)

  let chunksBlob: Blob[] = []
  let chunksHash: string[] = []
  let fileHash = ''

  if (isBrowserEnv) {
    const res = await processFileInBrowser(param.file!, config)
    chunksBlob = res.chunksBlob
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  if (isNodeEnv) {
    const res = await processFileInNode(param.filePath!, config)
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  const res: HashChksRes = {
    chunksHash,
    merkleHash: fileHash,
    metadata,
  }

  if (isBrowserEnv) {
    res.chunksBlob = chunksBlob
  }

  return res
}

function destroyWorkerPool() {
  workerService && workerService.terminate()
}

export { getFileHashChunks, destroyWorkerPool }
