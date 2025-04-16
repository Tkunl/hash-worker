import { crc32, md5, xxhash64 } from 'hash-wasm'
import { Strategy, WorkerReq, WorkerRes } from '../types'

/**
 * [1, 2, 3, 4] => [[1, 2], [3, 4]]
 * @param chunks 原始数组
 * @param size 分 part 大小
 */
export function getArrParts<T>(chunks: T[], size: number): T[][] {
  const result: T[][] = []
  let tempPart: T[] = []
  chunks.forEach((chunk: T) => {
    tempPart.push(chunk)
    if (tempPart.length === size) {
      result.push(tempPart)
      tempPart = []
    }
  })
  if (tempPart.length !== 0) result.push(tempPart)
  return result
}

export function generateUUID(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function calculateHash(req: WorkerReq): Promise<WorkerRes<string>> {
  const { chunk: buf, strategy } = req
  const data = new Uint8Array(buf)

  const hash = await {
    [Strategy.md5]: md5,
    [Strategy.crc32]: crc32,
    [Strategy.xxHash64]: xxhash64,
    [Strategy.mixed]: () => '', // 永远也不会执行到这里
  }[strategy](data)

  return { result: hash, chunk: buf }
}
