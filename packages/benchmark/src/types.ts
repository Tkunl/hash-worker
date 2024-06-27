import { HashChksParam, Strategy } from 'hash-worker'

export interface BenchmarkOptions {
  sizeInMB?: number
  strategy?: Strategy
  workerCountTobeTest?: number[]
}

export interface NormalizeOptions {
  sizeInMB: number
  params: HashChksParam[]
}
