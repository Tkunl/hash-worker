import { getArrayBufFromBlobs, getFileMetadata, sliceFile } from '../../src/utils'
import path from 'path'
import fs from 'fs/promises'
import { MockBlob } from '../fixture/mock-blob'

// 在测试文件的顶部，模拟 Blob.prototype.arrayBuffer
function mockArrayBuffer(): void {
  // 将全局 Blob 替换为 MockBlob
  global.Blob = MockBlob
}

describe('sliceFile', () => {
  it('should slice a file into chunks of specified size', () => {
    // 创建一个模拟的 File 对象
    const file = new File([new ArrayBuffer(5 * 1024 * 1024)], 'test.pdf', {
      type: 'application/pdf',
    }) // 创建一个5MB的文件

    const chunks = sliceFile(file, 1) // 指定将文件分割成1MB大小的块

    // 断言：检查chunks的长度是否为5
    expect(chunks.length).toBe(5)

    // 遍历chunks，验证每个块的大小是否符合预期（除了最后一个块可能小于1MB）
    chunks.forEach((chunk, index) => {
      if (index === chunks.length - 1) {
        // 若是最后一个块，则其大小应小于等于1MB
        expect(chunk.size).toBeLessThanOrEqual(1 * 1024 * 1024)
      } else {
        // 否则，每个块的大小应该严格等于1MB
        expect(chunk.size).toBe(1 * 1024 * 1024)
      }
    })
  })
})

describe('getArrayBufFromBlobs', () => {
  beforeAll(() => {
    // 在所有测试运行之前模拟 arrayBuffer
    mockArrayBuffer()
  })

  it('should correctly return array buffers from an array of blobs', async () => {
    // 创建测试用的 ArrayBuffer 和 Blob
    const buffer1 = new ArrayBuffer(10)
    const buffer2 = new ArrayBuffer(20)
    const blob1 = new Blob([buffer1])
    const blob2 = new Blob([buffer2])

    // 调用你的函数
    const result = await getArrayBufFromBlobs([blob1, blob2])

    // 进行断言
    expect(result.length).toBe(2)
    expect(result[0]).toBeInstanceOf(ArrayBuffer)
    expect(result[1]).toBeInstanceOf(ArrayBuffer)
    expect(result[0].byteLength).toEqual(10)
    expect(result[1].byteLength).toEqual(20)
  })
})

describe('getFileMetadata', () => {
  it('should correctly return file metadata in browser env', async () => {
    const fileName = 'test.pdf'
    // 创建一个模拟的 File 对象
    const file = new File([new ArrayBuffer(5 * 1024 * 1024)], fileName, {
      type: 'application/pdf',
    }) // 创建一个 5MB 的文件

    const fileInfo = await getFileMetadata(file)
    expect(fileInfo.name).toBe(fileName)
    expect(fileInfo.type).toBe('.pdf')
  })

  it('should correctly return file metadata in node env', async () => {
    const filePath = path.join(__dirname, './../fixture/mock-file.txt')

    const fileInfo = await getFileMetadata(undefined, filePath)
    const stats = await fs.stat(filePath)

    expect(fileInfo.name).toBe('mock-file.txt')
    expect(fileInfo.size).toBe(stats.size / 1024)
    expect(fileInfo.type).toBe('.txt')
  })
})
