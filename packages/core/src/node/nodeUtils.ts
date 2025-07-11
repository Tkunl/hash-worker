import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { FileMetaInfo } from '../types'
import { getFileExtension } from '../shared/utils'

/**
 * 读取一个文件并将它转成 ArrayBuffer
 * @param filePath 文件路径
 * @param start 起始位置(字节)
 * @param end 结束位置(字节)
 */
export async function readFileAsArrayBuffer(
  filePath: string,
  start: number,
  end: number,
): Promise<ArrayBuffer> {
  try {
    const readStream = fs.createReadStream(filePath, { start, end })
    const chunks: any[] = []
    return new Promise<ArrayBuffer>((resolve, reject) => {
      readStream.on('data', (chunk) => {
        chunks.push(chunk) // 收集数据块
      })

      readStream.on('end', () => {
        const buf = Buffer.concat(chunks) // 合并所有数据块构成 Buffer
        const arrayBuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
        resolve(arrayBuf)
      })

      readStream.on('error', (error) => {
        reject(new Error(`Failed to read file: ${error.message}`))
      })
    })
  } catch (error) {
    throw new Error(
      `Failed to create read stream: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * 分割文件, 获取每个分片的起止位置
 * @param filePath 文件路径
 * @param baseSize 默认分块大小为 1MB
 */
export async function getFileSliceLocations(filePath: string, baseSize = 1) {
  if (baseSize <= 0) throw new Error('baseSize must be greater than 0')

  try {
    const chunkSize = Math.max(1, baseSize * 1048576) // 1MB = 1024 * 1024
    const stats = await fsp.stat(filePath)
    const fileSize = stats.size // Bytes 字节
    const sliceLocation: [number, number][] = []

    for (let cur = 0; cur < fileSize; cur += chunkSize) {
      const end = Math.min(cur + chunkSize - 1, fileSize - 1)
      sliceLocation.push([cur, end])
    }

    return { sliceLocation, endLocation: fileSize }
  } catch (error) {
    throw new Error(
      `Failed to get file slice locations: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * 获取文件元数据
 * @param filePath 文件路径
 */
export async function getFileMetadata(filePath: string): Promise<FileMetaInfo> {
  try {
    const stats = await fsp.stat(filePath)
    const fileName = path.basename(filePath)

    // 使用改进的文件扩展名检测逻辑
    const fileType = getFileExtension(fileName)

    return {
      name: fileName,
      size: stats.size / 1024, // 转换为 KB，与接口文档保持一致
      lastModified: stats.mtime.getTime(),
      type: fileType,
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const fsError = error as NodeJS.ErrnoException
      if (fsError.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`)
      } else if (fsError.code === 'EACCES') {
        throw new Error(`Permission denied: ${filePath}`)
      }
    }
    throw new Error(
      `Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
