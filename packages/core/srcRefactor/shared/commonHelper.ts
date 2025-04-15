import { BaseWorkerService, BORDER_COUNT, DEFAULT_MAX_WORKERS, MerkleTree } from '.'
import { Strategy } from '../types'
import { crc32, md5, xxhash64 } from 'hash-wasm'

export function mergeConfig(paramConfig?: {
  chunkSize?: number
  workerCount?: number
  strategy?: Strategy
  borderCount?: number
  isCloseWorkerImmediately?: boolean
  isShowLog?: boolean
}) {
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

export async function getChunksHashSingle(strategy: Strategy, arrayBuffer: ArrayBuffer) {
  const unit8Array = new Uint8Array(arrayBuffer)
  const hashFunctions = {
    [Strategy.md5]: md5,
    [Strategy.crc32]: crc32,
    [Strategy.xxHash64]: xxhash64,
  }
  const selectedStrategy = strategy === Strategy.mixed ? Strategy.md5 : strategy
  const hashFn = hashFunctions[selectedStrategy]
  if (!hashFn) {
    throw new Error('Unknown strategy')
  }
  return [await hashFn(unit8Array)]
}

export function getChunksHashMultiple(
  strategy: Strategy,
  arrayBuffers: ArrayBuffer[],
  chunksCount: number,
  borderCount: number,
  workerSvc: BaseWorkerService,
) {
  const strategyHandlers = {
    [Strategy.xxHash64]: () => workerSvc.getXxHash64ForFiles(arrayBuffers),
    [Strategy.md5]: () => workerSvc.getMD5ForFiles(arrayBuffers),
    [Strategy.crc32]: () => workerSvc.getCRC32ForFiles(arrayBuffers),
    [Strategy.mixed]: () =>
      chunksCount <= borderCount
        ? workerSvc.getMD5ForFiles(arrayBuffers)
        : workerSvc.getCRC32ForFiles(arrayBuffers),
  }
  const handler = strategyHandlers[strategy]
  if (!handler) {
    throw new Error(`Unsupported strategy: ${strategy}`)
  }
  return handler()
}

export async function getRootHashByChunks(hashList: string[]) {
  const merkleTree = new MerkleTree()
  await merkleTree.init(hashList)
  return merkleTree.getRootHash()
}
