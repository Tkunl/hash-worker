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

export async function createMockFileInLocal(filePath: string, sizeInMB: number): Promise<void> {
  const { createWriteStream } = await import('fs')
  const { randomBytes } = await import('crypto')

  const stream = createWriteStream(filePath)
  const size = 1024 * 1024 * sizeInMB // 总大小转换为字节
  const chunkSize = 1024 * 512 // 每次写入512KB

  let written = 0

  return new Promise<void>((resolve, reject) => {
    stream.on('error', reject)
    const write = (): void => {
      let ok = true
      do {
        const chunk = randomBytes(chunkSize > size - written ? size - written : chunkSize)
        written += chunk.length // 更新已写入的长度

        if (written >= size) {
          // 如果达到或超过预定大小，则写入最后一个块并结束
          stream.write(chunk, () => stream.end())
          resolve()
        } else {
          // 否则，继续写入
          ok = stream.write(chunk)
        }
      } while (written < size && ok)
      if (written < size) {
        // 'drain' 事件会在可以安全地继续写入数据到流中时触发
        stream.once('drain', write)
      }
    }
    write()
  })
}

export async function deleteLocalFile(path: string) {
  const { unlinkSync } = await import('fs')
  unlinkSync(path)
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
