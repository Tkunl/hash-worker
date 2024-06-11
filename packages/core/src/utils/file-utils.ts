import fsc from 'fs'

/**
 * 分割文件
 * @param file
 * @param baseSize 默认分块大小为 1MB
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
  const readStream = fsc.createReadStream(path, { start, end })
  const chunks: any[] = []
  return new Promise<ArrayBuffer>((rs, rj) => {
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
