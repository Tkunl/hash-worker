import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'

/**
 * 读取一个文件并将它转成 ArrayBuffer
 * @param path 文件路径
 * @param start 起始位置(字节)
 * @param end 结束位置(字节)
 */
export async function readFileAsArrayBuffer(path: string, start: number, end: number) {
  const readStream = fs.createReadStream(path, { start, end })
  // TODO any 待修复
  const chunks: any[] = []
  return new Promise((rs, rj) => {
    readStream.on('data', (chunk) => {
      chunks.push(chunk) // 收集数据块
    })

    readStream.on('end', () => {
      const buf = Buffer.concat(chunks) // 合并所有数据块构成 Buffer
      const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
      rs(arrayBuf)
    })

    readStream.on('error', (e) => {
      rj(e)
    })
  })
}

/**
 * 分割文件, 获取每个分片的起止位置
 * @param filePath
 * @param baseSize 默认分块大小为 1MB
 */
export async function getFileSliceLocations(filePath: string, baseSize = 1) {
  if (baseSize <= 0) throw Error('baseSize must be greater than 0')
  const chunkSize = Math.max(1, baseSize * 1048576) // 1MB = 1024 * 1024
  const stats = await fsp.stat(filePath)
  const end = stats.size // Bytes 字节
  const sliceLocation: [number, number][] = []
  for (let cur = 0; cur < end; cur += chunkSize) {
    sliceLocation.push([cur, cur + chunkSize - 1])
  }
  return { sliceLocation, endLocation: end }
}

/**
 * 获取文件元数据
 * @param filePath 文件路径
 */
export async function getFileMetadata(filePath: string) {
  const stats = await fsp.stat(filePath)
  return {
    name: path.basename(filePath),
    size: stats.size / 1024,
    lastModified: stats.mtime.getTime(),
    type: path.extname(filePath),
  }
}
