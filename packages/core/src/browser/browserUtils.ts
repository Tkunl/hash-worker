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
export async function getFileMetadata(file: File): Promise<FileMetaInfo> {
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
