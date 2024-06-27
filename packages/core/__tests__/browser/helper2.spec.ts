import * as helper from '../../src/helper'
import { Config, Strategy } from '../../src/interface'
import { getFileSliceLocations, readFileAsArrayBuffer, sliceFile } from '../../src/utils'
import { WorkerService } from '../../src/worker/worker-service'
import { MockBlob } from '../fixture/mock-blob'
import { getRootHashByChunks } from '../../src/get-root-hash-by-chunks'
import { processFileInBrowser, processFileInNode } from '../../src/helper'

global.Blob = MockBlob

jest.mock('../../src/worker/worker-service', () => ({
  WorkerService: jest.fn().mockImplementation(() => ({
    terminate: jest.fn(),
  })),
}))

jest.mock('../../src/utils/file-utils', () => ({
  sliceFile: jest.fn(),
  getArrayBufFromBlobs: jest.fn(),
  getFileSliceLocations: jest.fn(),
  readFileAsArrayBuffer: jest.fn(),
}))

jest.mock('../../src/helper', () => ({
  ...jest.requireActual('../../src/helper'), // 从中导入所有原始实现
  getChunksHashSingle: jest.fn(),
  getChunksHashMultiple: jest.fn(),
}))

jest.mock('../../src/get-root-hash-by-chunks', () => ({
  getRootHashByChunks: jest.fn(),
}))

describe('processFileInBrowser', () => {
  const fakeFile = new File([], 'test.pdf', {
    type: 'application/pdf',
  })
  const config: Required<Config> = {
    chunkSize: 10,
    strategy: Strategy.md5,
    workerCount: 6,
    isCloseWorkerImmediately: true,
    borderCount: 2,
    isShowLog: false,
  }
  const workerSvc = new WorkerService(1)

  beforeEach(() => {
    // 用于清除所有已模拟函数（mock functions）的调用记录和实例数据
    jest.clearAllMocks()
  })

  it('should process single chunk file by using processFileInBrowser function', async () => {
    ;(sliceFile as jest.Mock).mockReturnValue([new Blob(['chunk'])])
    ;(helper.getChunksHashSingle as jest.Mock).mockResolvedValue(['hash1'])
    ;(getRootHashByChunks as jest.Mock).mockResolvedValue('rootHash')

    const result = await helper.processFileInBrowser(
      fakeFile,
      config,
      workerSvc,
      helper.getChunksHashSingle,
      helper.getChunksHashMultiple,
    )

    expect(sliceFile).toHaveBeenCalledWith(fakeFile, config.chunkSize)
    expect(helper.getChunksHashSingle).toHaveBeenCalled()
    expect(getRootHashByChunks).toHaveBeenCalledWith(['hash1'])
    expect(result.fileHash).toEqual('rootHash')
  })

  it('should process multiple chunk file by using processFileInBrowser function', async () => {
    ;(sliceFile as jest.Mock).mockReturnValue([new Blob(['chunk']), new Blob(['chunk2'])])
    ;(helper.getChunksHashMultiple as jest.Mock).mockResolvedValue(['hash1', 'hash2'])
    ;(getRootHashByChunks as jest.Mock).mockResolvedValue('rootHash')

    const result = await processFileInBrowser(
      fakeFile,
      config,
      workerSvc,
      helper.getChunksHashSingle,
      helper.getChunksHashMultiple,
    )

    expect(sliceFile).toHaveBeenCalledWith(fakeFile, config.chunkSize)
    expect(helper.getChunksHashMultiple as jest.Mock).toHaveBeenCalled()
    expect(getRootHashByChunks).toHaveBeenCalledWith(['hash1', 'hash2'])
    expect(result.fileHash).toEqual('rootHash')
  })
})

describe('processFileInNode function', () => {
  const config: Required<Config> = {
    chunkSize: 10,
    strategy: Strategy.md5,
    workerCount: 6,
    isCloseWorkerImmediately: true,
    borderCount: 2,
    isShowLog: false,
  }

  const workerSvc = new WorkerService(1)

  beforeEach(() => {
    // 用于清除所有已模拟函数（mock functions）的调用记录和实例数据
    jest.clearAllMocks()
  })

  it('should process single chunk file by using processFileInNode function', async () => {
    ;(helper.getChunksHashSingle as jest.Mock).mockResolvedValue(['hash1'])
    ;(getFileSliceLocations as jest.Mock).mockResolvedValue({ sliceLocation: [0], endLocation: 10 })
    ;(readFileAsArrayBuffer as jest.Mock).mockResolvedValue(new ArrayBuffer(10))
    ;(getRootHashByChunks as jest.Mock).mockResolvedValue('rootHash')

    const result = await processFileInNode(
      'dummyPath',
      config,
      workerSvc,
      helper.getChunksHashSingle,
      helper.getChunksHashMultiple,
    )

    expect(result.chunksHash).toEqual(['hash1'])
    expect(helper.getChunksHashSingle).toHaveBeenCalled()
    expect(result.fileHash).toEqual('rootHash')
  })

  it('should process multiple chunk file by using processFileInNode function', async () => {
    ;(helper.getChunksHashMultiple as jest.Mock).mockResolvedValue(['hash1', 'hash2'])
    ;(getFileSliceLocations as jest.Mock).mockResolvedValue({
      sliceLocation: [0, 10],
      endLocation: 20,
    })
    ;(readFileAsArrayBuffer as jest.Mock).mockResolvedValue(new ArrayBuffer(10))
    ;(getRootHashByChunks as jest.Mock).mockResolvedValue('rootHash')

    const result = await processFileInNode(
      'dummyPath',
      config,
      workerSvc,
      helper.getChunksHashSingle,
      helper.getChunksHashMultiple,
    )

    expect(result.chunksHash).toEqual(['hash1', 'hash2'])
    expect(helper.getChunksHashMultiple).toHaveBeenCalled()
    expect(result.fileHash).toEqual('rootHash')
  })
})
