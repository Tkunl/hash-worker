/**
 * 分割文件
 * @param file
 * @param baseSize 默认分块大小为 1MB
 * @private
 */
export function sliceFile(file: File, baseSize = 1) {
  const chunkSize = baseSize * 1024 * 1024 // KB
  const chunks: Blob[] = []
  let startPos = 0
  while (startPos < file.size) {
    chunks.push(file.slice(startPos, startPos + chunkSize))
    startPos += chunkSize
  }
  return chunks
}

/**
 * 将 File 转成 ArrayBuffer
 * 注意: Blob 无法直接移交到 Worker 中, 所以需要放到主线程中执行
 * @param chunks
 * @private
 */
export async function getArrayBufFromBlobs(chunks: Blob[]): Promise<ArrayBuffer[]> {
  return Promise.all(chunks.map(chunk => chunk.arrayBuffer()))
}
