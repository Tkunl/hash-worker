import { HashChksParam, Strategy } from 'hash-worker'

export interface BenchmarkOptions {
  sizeInMB?: number // 默认: 测试文件 500MB
  strategy?: Strategy // 默认: 使用 MD5 作为 hash 策略
  workerCountTobeTest?: number[] // 默认: 1, 4, 8, 12 线程各测三次
}

export interface NormalizeOptions {
  sizeInMB: number
  params: HashChksParam[]
}
