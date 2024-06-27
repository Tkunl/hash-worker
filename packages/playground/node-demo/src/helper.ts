import { createWriteStream, unlinkSync } from 'fs'
import { randomBytes } from 'crypto'

export function generateRandomData(size: number): string {
  return randomBytes(size).toString('hex')
}

export async function createLargeFile(filePath: string, sizeInMB: number): Promise<void> {
  const stream = createWriteStream(filePath)
  const size = 1024 * 1024 * sizeInMB // 总大小转换为字节
  const chunkSize = 1024 * 512 // 每次写入512KB

  let written = 0

  return new Promise<void>((resolve, reject) => {
    stream.on('error', reject)
    const write = (): void => {
      let ok = true
      do {
        const chunk = generateRandomData(chunkSize > size - written ? size - written : chunkSize)
        written += chunk.length / 2 // 更新已写入的长度，除以2因为hex字符串表示的字节长度是实际长度的一半

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

export function deleteFile(path: string) {
  unlinkSync(path)
}

export async function sleep(ms: number) {
  await new Promise<void>((rs) => setTimeout(() => rs(), 500))
}
