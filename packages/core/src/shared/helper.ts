import { crc32, md5, xxhash64 } from 'hash-wasm'
import { BORDER_COUNT, DEFAULT_MAX_WORKERS, MerkleTree } from '.'
import { Strategy } from '../types'

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

export function getChunksHashMultipleStrategy(
  strategy: Strategy,
  chunksCount: number,
  borderCount: number,
) {
  const strategyMap = {
    [Strategy.xxHash64]: Strategy.xxHash64,
    [Strategy.md5]: Strategy.md5,
    [Strategy.crc32]: Strategy.crc32,
    [Strategy.mixed]: chunksCount <= borderCount ? Strategy.md5 : Strategy.crc32,
  }
  const result = strategyMap[strategy]
  if (!result) {
    throw new Error(`Unsupported strategy: ${strategy}`)
  }
  return result
}

export async function getMerkleRootHashByChunks(hashList: string[]) {
  const merkleTree = new MerkleTree()
  await merkleTree.init(hashList)
  return merkleTree.getRootHash()
}
