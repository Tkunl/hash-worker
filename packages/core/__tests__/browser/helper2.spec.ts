import { Strategy } from '../../src/enum'
import * as helper from '../../src/helper'
import { Config } from '../../src/interface'
import { sliceFile } from '../../src/utils/file-utils'
import { WorkerService } from '../../src/worker/worker-service'
import { MockBlob } from '../fixture/mock-blob'

global.Blob = MockBlob

jest.mock('../../src/worker/worker-service', () => ({
  WorkerService: jest.fn().mockImplementation(() => ({
    terminate: jest.fn(),
  })),
}))

jest.mock('../../src/utils/file-utils', () => ({
  sliceFile: jest.fn(),
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
  }
  const workerSvc = new WorkerService(1)

  beforeEach(() => {
    // 用于清除所有已模拟函数（mock functions）的调用记录和实例数据
    jest.clearAllMocks()
  })

  it('should process single chunk file', async () => {
    ;(sliceFile as jest.Mock).mockReturnValue([new Blob(['chunk'])])

    const result = await helper.processFileInBrowser(fakeFile, config, workerSvc)
    expect(sliceFile).toHaveBeenCalledWith(fakeFile, config.chunkSize)
    expect(result.fileHash).toEqual('5a8f4fa2aeab5431888ee8a18ce3bcea')
  })
})
