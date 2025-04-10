import { FileMetaInfo } from '../interface'
import { isBrowser, isNode } from './is'

/**
 * 分割文件
 * @param file
 * @param baseSize 默认分块大小为 1MB
 */
export function sliceFile(file: File, baseSize = 1) {
  if (baseSize <= 0) throw Error('baseSize must be greater than 0')
  const chunkSize = Math.max(1, baseSize * 1048576) // 1MB = 1024 * 1024
  const chunks: Blob[] = []
  let startPos = 0
  while (startPos < file.size) {
    chunks.push(file.slice(startPos, startPos + chunkSize))
    startPos += chunkSize
  }
  return chunks
}

/**
 * 分割文件, 获取每个分片的起止位置
 * @param filePath
 * @param baseSize 默认分块大小为 1MB
 */
export async function getFileSliceLocations(filePath: string, baseSize = 1) {
  if (baseSize <= 0) throw Error('baseSize must be greater than 0')
  const fsp = await import('fs/promises')
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
 * 将 File 转成 ArrayBuffer
 * 注意: Blob 无法直接移交到 Worker 中, 所以需要放到主线程中执行
 * @param chunks
 */
export async function getArrayBufFromBlobs(chunks: Blob[]): Promise<ArrayBuffer[]> {
  return Promise.all(chunks.map((chunk) => chunk.arrayBuffer()))
}

/**
 * 读取一个文件并将它转成 ArrayBuffer
 * @param path 文件路径
 * @param start 起始位置(字节)
 * @param end 结束位置(字节)
 */
export async function readFileAsArrayBuffer(path: string, start: number, end: number) {
  const fs = await import('fs')
  const readStream = fs.createReadStream(path, { start, end })
  const chunks: any[] = []
  return new Promise<ArrayBuffer>((rs, rj) => {
    readStream.on('data', (chunk) => {
      chunks.push(chunk) // 收集数据块
    })

    readStream.on('end', () => {
      const buf = Buffer.concat(chunks) // 合并所有数据块构成 Buffer
      const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
      rs(arrayBuf as ArrayBuffer)
    })

    readStream.on('error', (e) => {
      rj(e)
    })
  })
}

/**
 * 获取文件元数据
 * @param file 文件
 * @param filePath 文件路径
 */
export async function getFileMetadata(file?: File, filePath?: string): Promise<FileMetaInfo> {
  if (file && isBrowser()) {
    let fileType: string | undefined = ''

    if (file.name.includes('.')) {
      fileType = file.name.split('.').pop()
      fileType = fileType !== void 0 ? '.' + fileType : ''
    }

    return {
      name: file.name,
      size: file.size / 1024,
      lastModified: file.lastModified,
      type: fileType,
    }
  }

  if (filePath && isNode()) {
    const fsp: typeof import('node:fs/promises') = await import('fs/promises')
    const path: typeof import('node:path') = await import('path')
    const stats = await fsp.stat(filePath)
    return {
      name: path.basename(filePath),
      size: stats.size / 1024,
      lastModified: stats.mtime.getTime(),
      type: path.extname(filePath),
    }
  }
  throw new Error('Unsupported environment')
}
