import { BORDER_COUNT, DEFAULT_MAX_WORKERS, HASH_FUNCTIONS, HashFn, MerkleTree } from '.'
import { Config, Strategy, WorkerReq, WorkerRes } from '../types'

export async function getMerkleRootHashByChunks(hashList: string[], hashFn?: HashFn) {
  const merkleTree = new MerkleTree(hashFn)
  await merkleTree.init(hashList)
  return merkleTree.getRootHash()
}

export function mergeConfig(paramConfig?: Config) {
  const { chunkSize, workerCount, strategy, borderCount, isCloseWorkerImmediately, isShowLog } =
    paramConfig ?? {}

  return {
    chunkSize: chunkSize ?? 10,
    workerCount: workerCount ?? DEFAULT_MAX_WORKERS,
    strategy: strategy ?? Strategy.mixed,
    borderCount: borderCount ?? BORDER_COUNT,
    isCloseWorkerImmediately: isCloseWorkerImmediately ?? true,
    isShowLog: isShowLog ?? false,
  }
}

function resolveStrategy(strategy: Strategy, chunksCount?: number, borderCount?: number) {
  if (strategy !== Strategy.mixed) {
    return strategy
  }

  if (chunksCount !== undefined && borderCount !== undefined) {
    return chunksCount <= borderCount ? Strategy.md5 : Strategy.crc32
  }

  // 默认处理没有边界参数的情况（单块场景）
  return Strategy.md5
}

export async function calculateHashInWorker(req: WorkerReq): Promise<WorkerRes<string>> {
  const { chunk: buf, strategy } = req
  const data = new Uint8Array(buf)

  // 明确处理 mixed 策略的非法情况
  if (strategy === Strategy.mixed) {
    throw new Error('Mixed strategy not supported in worker calculation')
  }

  const hashFn = HASH_FUNCTIONS[strategy]
  if (!hashFn) {
    throw new Error(`Unsupported strategy: ${strategy}`)
  }

  const hash = await hashFn(data)
  return { result: hash, chunk: buf }
}

export async function getChunksHashSingle(strategy: Strategy, arrayBuffer: ArrayBuffer) {
  const unit8Array = new Uint8Array(arrayBuffer)
  const selectedStrategy = resolveStrategy(strategy)
  const hashFn = HASH_FUNCTIONS[selectedStrategy]

  if (!hashFn) {
    throw new Error(`Unsupported strategy: ${selectedStrategy}`)
  }

  return [await hashFn(unit8Array)]
}

export function getChunksHashMultipleStrategy(
  strategy: Strategy,
  chunksCount: number,
  borderCount: number,
) {
  return resolveStrategy(strategy, chunksCount, borderCount)
}
