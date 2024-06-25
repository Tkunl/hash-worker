jest.mock('hash-wasm', () => ({
  crc32: jest.fn(() => Promise.resolve('crc32hash')),
  md5: jest.fn(() => Promise.resolve('md5hash')),
}))

jest.mock('../../src/utils/is', () => ({
  isNode: jest.fn(() => false),
  isBrowser: jest.fn(() => false),
}))

jest.mock('../../src/worker/worker-service', () => {
  return {
    WorkerService: jest.fn().mockImplementation(() => ({
      getMD5ForFiles: jest.fn(),
      getCRC32ForFiles: jest.fn(),
      terminate: jest.fn(),
    })),
  }
})

import { Strategy } from '../../src/enum'
import { getChunksHashMultiple, getChunksHashSingle, normalizeParam } from '../../src/helper'
import * as is from '../../src/utils/is'
import { WorkerService } from '../../src/worker/worker-service'

function setNodeEnv() {
  ;(is.isNode as jest.Mock).mockImplementation(() => true)
  ;(is.isBrowser as jest.Mock).mockImplementation(() => false)
}

function setBrowserEnv() {
  ;(is.isNode as jest.Mock).mockImplementation(() => false)
  ;(is.isBrowser as jest.Mock).mockImplementation(() => true)
}

describe('normalizeParam', () => {
  let mockFile: File

  beforeAll(async () => {
    mockFile = new File([new ArrayBuffer(5)], 'test.pdf', {
      type: 'application/pdf',
    })
  })

  it('throws an error for unsupported environment', () => {
    expect(() => {
      normalizeParam({ filePath: '' })
    }).toThrow('Unsupported environment')
  })

  it('requires filePath attribute in node environment', () => {
    setNodeEnv()
    expect(() => {
      normalizeParam({ file: mockFile })
    }).toThrow('The filePath attribute is required in node environment')
  })

  it('requires filePath attribute in browser environment', () => {
    setBrowserEnv()
    expect(() => {
      normalizeParam({ filePath: 'mockPath' })
    }).toThrow('The file attribute is required in browser environment')
  })

  it('get filePath in param correctly in node environment', () => {
    setNodeEnv()
    const param = normalizeParam({ filePath: 'mockPath' })
    expect(param.filePath).toBe('mockPath')
  })

  it('get file in param correctly in browser environment', () => {
    setBrowserEnv()
    const param = normalizeParam({ file: mockFile })
    expect(param.file).toBeTruthy()
  })
})

describe('getChunksHashSingle', () => {
  const testArrayBuffer = new Uint8Array([1, 2, 3]).buffer

  it('should use md5 hashing strategy for md5 strategy option', async () => {
    const result = await getChunksHashSingle(Strategy.md5, testArrayBuffer)
    expect(result).toEqual(['md5hash'])
  })

  it('should use md5 hashing strategy for mixed strategy option', async () => {
    const result = await getChunksHashSingle(Strategy.mixed, testArrayBuffer)
    expect(result).toEqual(['md5hash'])
  })

  it('should use crc32 hashing strategy for crc32 strategy option', async () => {
    const result = await getChunksHashSingle(Strategy.crc32, testArrayBuffer)
    expect(result).toEqual(['crc32hash'])
  })
})

describe('getChunksHashMultiple', () => {
  const arrayBuffers: ArrayBuffer[] = [new ArrayBuffer(10), new ArrayBuffer(20)]
  let workerSvc: WorkerService

  beforeEach(() => {
    workerSvc = new WorkerService(6)
  })

  it('should use MD5 hashing for MD5 strategy', async () => {
    await getChunksHashMultiple(Strategy.md5, arrayBuffers, 5, 3, workerSvc)
    expect(workerSvc.getMD5ForFiles).toHaveBeenCalledWith(arrayBuffers)
  })

  it('should use CRC32 hashing for CRC32 strategy', async () => {
    await getChunksHashMultiple(Strategy.crc32, arrayBuffers, 5, 3, workerSvc)
    expect(workerSvc.getCRC32ForFiles).toHaveBeenCalledWith(arrayBuffers)
  })

  it('should use MD5 hashing for mixed strategy when chunksCount <= borderCount', async () => {
    await getChunksHashMultiple(Strategy.mixed, arrayBuffers, 2, 3, workerSvc)
    expect(workerSvc.getMD5ForFiles).toHaveBeenCalledWith(arrayBuffers)
  })

  it('should use CRC32 hashing for mixed strategy when chunksCount > borderCount', async () => {
    await getChunksHashMultiple(Strategy.mixed, arrayBuffers, 4, 3, workerSvc)
    expect(workerSvc.getCRC32ForFiles).toHaveBeenCalledWith(arrayBuffers)
  })
})
