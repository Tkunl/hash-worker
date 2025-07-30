import { DEFAULT_MAX_WORKERS, HASH_FUNCTIONS } from './constant'
import { HashFn, MerkleTree } from './merkleTree'
import { Config, Strategy, WorkerReq, WorkerRes } from '../types'

export async function getMerkleRootHashByChunks(hashList: string[], hashFn?: HashFn) {
  const merkleTree = new MerkleTree(hashFn)
  await merkleTree.init(hashList)
  return merkleTree.getRootHash()
}

export function mergeConfig(paramConfig?: Config) {
  const { chunkSize, workerCount, strategy, isCloseWorkerImmediately, isShowLog } =
    paramConfig ?? {}

  return {
    chunkSize: chunkSize ?? 10,
    workerCount: workerCount ?? DEFAULT_MAX_WORKERS,
    strategy: strategy ?? Strategy.xxHash128,
    isCloseWorkerImmediately: isCloseWorkerImmediately ?? true,
    isShowLog: isShowLog ?? false,
  }
}

export async function calculateHashInWorker(req: WorkerReq): Promise<WorkerRes<string>> {
  const { chunk: buf, strategy } = req
  const data = new Uint8Array(buf)

  const hashFn = HASH_FUNCTIONS[strategy]
  if (!hashFn) {
    throw new Error(`calculateHashInWorker: Unsupported strategy: ${strategy}`)
  }

  const hash = await hashFn(data)
  return { result: hash, chunk: buf }
}

export async function getChunksHashSingle(strategy: Strategy, arrayBuffer: ArrayBuffer) {
  const uint8Array = new Uint8Array(arrayBuffer)
  const hashFn = HASH_FUNCTIONS[strategy]

  if (!hashFn) {
    throw new Error(`getChunksHashSingle: Unsupported strategy: ${strategy}`)
  }

  return [await hashFn(uint8Array)]
}
