import {
  getArrayBufFromBlobs,
  getArrParts,
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
  FileMetaInfo,
  HashChksParam,
  HashChksParamRes,
  NodeHashChksParam,
} from './interface'
import { Strategy } from './enum'
import { getRootHashByChunks } from './get-root-hash-by-chunks'
// import WebWorker from 'web-worker:./worker/test-worker.web-worker.ts'

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
    chunkSize: isEmpty(param.chunkSize) ? 10 : param.chunkSize!, // 默认 10MB 分片大小
    maxWorkerCount: isEmpty(param.maxWorkerCount) ? DEFAULT_MAX_WORKERS : param.maxWorkerCount!, // 默认使用 8个 Worker 线程
    strategy: isEmpty(param.strategy) ? Strategy.mixed : param.strategy!, // 默认使用混合模式计算 hash
    borderCount: isEmpty(param.borderCount) ? BORDER_COUNT : param.borderCount!, // 默认以 100 分片数量作为边界
    isCloseWorkerImmediately: isEmpty(param.isCloseWorkerImmediately) // 默认计算 hash 后立即关闭 worker
      ? true
      : param.isCloseWorkerImmediately!,
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
    return {
      name: file.name,
      size: file.size / 1024,
      lastModified: file.lastModified,
      type: file.type,
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

async function processFileInBrowser(
  file: File,
  chunkSize: number, // MB
  strategy: Strategy,
  maxWorkerCount: number,
  isCloseWorkerImmediately: boolean,
  borderCount: number,
) {
  if (!isBrowserEnv) throw new Error('Error environment')
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
    const chunksPart = getArrParts<Blob>(chunksBlob, maxWorkerCount)
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

async function processFileInNode(
  filePath: string,
  chunkSize: number, // MB
  strategy: Strategy,
  maxWorkerCount: number,
  isCloseWorkerImmediately: boolean,
  borderCount: number,
) {
  if (!isNodeEnv || !fsp) throw new Error('Error environment')
  let chunksHash: string[] = []
  const _chunkSize = chunkSize * 1024 * 1024 // MB
  const stats = await fsp.stat(filePath)
  const end = stats.size
  // 分割位置数组
  const sliceLocation: [number, number][] = []
  for (let cur = 0; cur < end; cur += _chunkSize) {
    sliceLocation.push([cur, cur + _chunkSize])
  }
  if (sliceLocation.length === 1) {
    const unit8Array = new Uint8Array(await readFileAsArrayBuffer(filePath, 0, end))
    chunksHash =
      strategy === Strategy.md5 || strategy === Strategy.mixed
        ? [await md5(unit8Array)]
        : [await crc32(unit8Array)]
  } else {
    // 分组后的起始分割位置
    const sliceLocationPart = getArrParts<[number, number]>(sliceLocation, maxWorkerCount)
    let chunksBuf: ArrayBuffer[] = []
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
async function getFileHashChunks(param: HashChksParam): Promise<HashChksParamRes> {
  const normalizedParam = normalizeParam(param)

  const { chunkSize, maxWorkerCount, strategy, borderCount, isCloseWorkerImmediately } =
    normalizedParam

  await initialize(maxWorkerCount)

  // 文件元数据
  const metadata = await getFileMetadata(param.file, param.filePath)

  let chunksBlob: Blob[] = []
  let chunksHash: string[] = []
  let fileHash = ''

  if (isBrowserEnv) {
    const res = await processFileInBrowser(
      param.file!,
      chunkSize,
      strategy,
      borderCount,
      isCloseWorkerImmediately,
      borderCount,
    )
    chunksBlob = res.chunksBlob
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  if (isNodeEnv) {
    const res = await processFileInNode(
      param.filePath!,
      chunkSize,
      strategy,
      borderCount,
      isCloseWorkerImmediately,
      borderCount,
    )

    // TODO 此处没有打印出来 ...
    console.log('node res: ', res)
    chunksHash = res.chunksHash
    fileHash = res.fileHash
  }

  const res: HashChksParamRes = {
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

async function testWorker() {
  if (isBrowserEnv) {
    const worker = new Worker(new URL('./worker/test-worker.web-worker.mjs', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (msg: any) => {
      console.log(msg)
    }
    worker.onerror = (e) => {
      console.log('error')
      console.log(e)
    }
    worker.postMessage('Hello')
  }

  if (isNodeEnv) {
    const { Worker: NodeWorker } = await import('worker_threads')
    const worker = new NodeWorker(new URL('./worker/test-worker.web-worker.mjs', import.meta.url))
    worker.on('message', (msg: any) => {
      console.log('message')
      console.log(msg)
    })
    worker.on('error', (e) => {
      console.log('error')
      console.log(e)
    })
    worker.postMessage('Hello')
  }
}

export { getFileHashChunks, destroyWorkerPool, testWorker }
