import { FileMetaInfo } from '../types'

/**
 * 将 File 转成 ArrayBuffer
 * 注意: Blob 无法直接移交到 Worker 中, 所以需要放到主线程中执行
 * @param chunks
 */
export async function getArrayBufFromBlobs(chunks: Blob[]) {
  return Promise.all(chunks.map((chunk) => chunk.arrayBuffer()))
}

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
  if (file.size === 0) {
    // 空文件返回一个空 Blob
    return [file.slice(0, 0)]
  }
  while (startPos < file.size) {
    chunks.push(file.slice(startPos, startPos + chunkSize))
    startPos += chunkSize
  }
  return chunks
}

/**
 * 获取文件元数据
 * @param file 文件
 */
export async function getFileMetadataInBrowser(file: File): Promise<FileMetaInfo> {
  let fileType = ''
  const name = file.name
  // 只处理有扩展名且不是以点开头/结尾的
  if (name && name.includes('.') && !name.startsWith('.') && !name.endsWith('.')) {
    const lastDot = name.lastIndexOf('.')
    if (lastDot > 0 && lastDot < name.length - 1) {
      fileType = '.' + name.slice(lastDot + 1)
    }
  }
  return {
    name: file.name,
    size: file.size / 1024,
    lastModified: file.lastModified,
    type: fileType,
  }
}
