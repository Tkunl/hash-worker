import {
  getArrayBufFromBlobs,
  sliceFile,
  getFileMetadataInBrowser,
} from '../../../src/browser/browserUtils'

// 注入 TextDecoder 以兼容 jsdom 环境
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

// Mock Blob.arrayBuffer method
const originalArrayBuffer = Blob.prototype.arrayBuffer
beforeAll(() => {
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.readAsArrayBuffer(this)
      })
    }
  }
})

afterAll(() => {
  if (originalArrayBuffer) {
    Blob.prototype.arrayBuffer = originalArrayBuffer
  }
})

describe('browserUtils', () => {
  describe('getArrayBufFromBlobs', () => {
    it('应该将 Blob 数组转换为 ArrayBuffer 数组', async () => {
      const text1 = 'Hello World'
      const text2 = 'Test Data'
      const blob1 = new Blob([text1], { type: 'text/plain' })
      const blob2 = new Blob([text2], { type: 'text/plain' })

      const result = await getArrayBufFromBlobs([blob1, blob2])

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(ArrayBuffer)
      expect(result[1]).toBeInstanceOf(ArrayBuffer)

      // 验证内容
      const decoder = new TextDecoder()
      expect(decoder.decode(result[0])).toBe(text1)
      expect(decoder.decode(result[1])).toBe(text2)
    })

    it('应该处理空数组', async () => {
      const result = await getArrayBufFromBlobs([])
      expect(result).toEqual([])
    })

    it('应该处理单个 Blob', async () => {
      const text = 'Single Blob Test'
      const blob = new Blob([text], { type: 'text/plain' })

      const result = await getArrayBufFromBlobs([blob])

      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(ArrayBuffer)

      const decoder = new TextDecoder()
      expect(decoder.decode(result[0])).toBe(text)
    })
  })

  describe('sliceFile', () => {
    it('应该按指定大小分割文件', () => {
      const fileContent = 'A'.repeat(3 * 1024 * 1024) // 3MB
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' })

      const chunks = sliceFile(file, 1) // 1MB chunks

      expect(chunks).toHaveLength(3)
      chunks.forEach((chunk: Blob) => {
        expect(chunk.size).toBeLessThanOrEqual(1024 * 1024)
      })
    })

    it('应该使用默认分块大小', () => {
      const fileContent = 'A'.repeat(2 * 1024 * 1024) // 2MB
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' })

      const chunks = sliceFile(file) // 默认 1MB

      expect(chunks).toHaveLength(2)
      chunks.forEach((chunk: Blob) => {
        expect(chunk.size).toBeLessThanOrEqual(1024 * 1024)
      })
    })

    it('应该处理小于分块大小的文件', () => {
      const fileContent = 'Small file content'
      const file = new File([fileContent], 'small.txt', { type: 'text/plain' })

      const chunks = sliceFile(file, 1)

      expect(chunks).toHaveLength(1)
      expect(chunks[0].size).toBe(fileContent.length)
    })

    it('应该处理自定义分块大小', () => {
      const fileContent = 'A'.repeat(5 * 1024 * 1024) // 5MB
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' })

      const chunks = sliceFile(file, 2) // 2MB chunks

      expect(chunks).toHaveLength(3) // 2MB + 2MB + 1MB
      expect(chunks[0].size).toBe(2 * 1024 * 1024)
      expect(chunks[1].size).toBe(2 * 1024 * 1024)
      expect(chunks[2].size).toBe(1 * 1024 * 1024)
    })

    it('应该处理小于 1MB 的分块大小', () => {
      const fileContent = 'A'.repeat(1024 * 1024) // 1MB
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' })

      const chunks = sliceFile(file, 0.5) // 0.5MB chunks

      expect(chunks).toHaveLength(2)
      chunks.forEach((chunk: Blob) => {
        expect(chunk.size).toBeLessThanOrEqual(0.5 * 1024 * 1024)
      })
    })

    it('应该抛出错误当 baseSize 小于等于 0', () => {
      const fileContent = 'Test content'
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' })

      expect(() => sliceFile(file, 0)).toThrow('baseSize must be greater than 0')
      expect(() => sliceFile(file, -1)).toThrow('baseSize must be greater than 0')
    })

    it('应该处理空文件', () => {
      const file = new File([], 'empty.txt', { type: 'text/plain' })

      const chunks = sliceFile(file, 1)

      // 空文件应该返回一个空的分块
      expect(chunks).toHaveLength(1)
      expect(chunks[0].size).toBe(0)
    })
  })

  describe('getFileMetadataInBrowser', () => {
    it('应该正确提取文件元数据', async () => {
      const fileContent = 'Test file content'
      const fileName = 'test-document.pdf'
      const fileSize = fileContent.length
      const lastModified = Date.now()

      const file = new File([fileContent], fileName, {
        type: 'application/pdf',
        lastModified,
      })

      const metadata = await getFileMetadataInBrowser(file)

      expect(metadata).toEqual({
        name: fileName,
        size: fileSize / 1024, // 转换为 KB
        lastModified,
        type: '.pdf',
      })
    })

    it('应该处理没有扩展名的文件', async () => {
      const fileContent = 'No extension content'
      const fileName = 'noextension'
      const file = new File([fileContent], fileName, { type: 'text/plain' })

      const metadata = await getFileMetadataInBrowser(file)

      expect(metadata.type).toBe('')
    })

    it('应该处理多个点的文件名', async () => {
      const fileContent = 'Multiple dots content'
      const fileName = 'file.name.with.dots.txt'
      const file = new File([fileContent], fileName, { type: 'text/plain' })

      const metadata = await getFileMetadataInBrowser(file)

      expect(metadata.type).toBe('.txt')
    })

    it('应该处理以点开头的文件名', async () => {
      const fileContent = 'Hidden file content'
      const fileName = '.hiddenfile'
      const file = new File([fileContent], fileName, { type: 'text/plain' })

      const metadata = await getFileMetadataInBrowser(file)

      // 以点开头的文件名应该返回空字符串作为扩展名
      expect(metadata.type).toBe('')
    })

    it('应该处理以点结尾的文件名', async () => {
      const fileContent = 'Ending with dot content'
      const fileName = 'file.'
      const file = new File([fileContent], fileName, { type: 'text/plain' })

      const metadata = await getFileMetadataInBrowser(file)

      // 以点结尾的文件名应该返回空字符串作为扩展名
      expect(metadata.type).toBe('')
    })

    it('应该处理空文件名', async () => {
      const fileContent = 'Empty name content'
      const fileName = ''
      const file = new File([fileContent], fileName, { type: 'text/plain' })

      const metadata = await getFileMetadataInBrowser(file)

      expect(metadata.name).toBe('')
      expect(metadata.type).toBe('')
    })

    it('应该处理大文件', async () => {
      const fileContent = 'A'.repeat(10 * 1024 * 1024) // 10MB
      const fileName = 'large-file.dat'
      const file = new File([fileContent], fileName, { type: 'application/octet-stream' })

      const metadata = await getFileMetadataInBrowser(file)

      expect(metadata.size).toBe(10 * 1024) // 10MB in KB
      expect(metadata.type).toBe('.dat')
    })

    it('应该处理特殊字符的文件名', async () => {
      const fileContent = 'Special chars content'
      const fileName = 'file-with-special-chars!@#$%^&*()_+-=[]{}|;:,.<>?.txt'
      const file = new File([fileContent], fileName, { type: 'text/plain' })

      const metadata = await getFileMetadataInBrowser(file)

      expect(metadata.name).toBe(fileName)
      expect(metadata.type).toBe('.txt')
    })
  })
})
