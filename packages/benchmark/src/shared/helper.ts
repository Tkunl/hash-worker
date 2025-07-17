import { BenchmarkOptions } from './types'
import { Strategy } from 'hash-worker'

export function normalizeBenchmarkOptions(options: BenchmarkOptions): Required<BenchmarkOptions> {
  const defaultWorkerCountTobeTest = [1, 1, 1, 4, 4, 4, 8, 8, 8, 12, 12, 12]
  const { sizeInMB, strategy, workerCountTobeTest } = options

  const normalizeOptions = {
    sizeInMB: sizeInMB ?? 500,
    strategy: strategy ?? Strategy.md5,
    workerCountTobeTest: workerCountTobeTest ?? defaultWorkerCountTobeTest,
  }

  const { workerCountTobeTest: _workerCountTobeTest } = normalizeOptions

  if (
    _workerCountTobeTest.length === 0 ||
    _workerCountTobeTest.find((num: number) => num <= 0 || num > 32 || !Number.isInteger(num))
  ) {
    throw new Error('Illegal workerCount')
  }

  return normalizeOptions
}

export async function sleep(ms: number) {
  await new Promise<void>((rs) => setTimeout(() => rs(), ms))
}

export function createMockFile(fileName: string, sizeInMB: number): File {
  // 每 MB 大约为 1048576 字节
  const size = sizeInMB * 1048576
  const buffer = new ArrayBuffer(size)
  const view = new Uint8Array(buffer)

  // 填充随机内容
  for (let i = 0; i < size; i++) {
    // 随机填充每个字节，这里是填充 0-255 的随机数
    // 实际应用中，你可能需要调整生成随机数的方式以达到所需的随机性
    view[i] = Math.floor(Math.random() * 256)
  }

  // 将 ArrayBuffer 转换为Blob
  const blob = new Blob([view], { type: 'application/octet-stream' })

  // 将 Blob 转换为File
  return new File([blob], fileName, { type: 'application/octet-stream' })
}
