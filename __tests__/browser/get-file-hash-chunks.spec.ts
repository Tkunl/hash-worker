jest.mock('../../packages/shared/src/is', () => ({
  isNode: jest.fn(() => false),
  isBrowser: jest.fn(() => false),
}))

jest.mock('../../packages/core/src/worker/worker-service', () => ({
  WorkerService: jest.fn(() => ({
    terminate: jest.fn(),
  })),
}))

jest.mock('../../packages/shared/src/file-utils', () => ({
  getFileMetadata: jest.fn(() => ({
    name: 'fakeFileName.txt',
  })),
}))

jest.mock('../../packages/core/src/helper', () => ({
  ...jest.requireActual('../../packages/core/src/helper'), // 从中导入所有原始实现
  processFileInBrowser: jest.fn(() => ({
    chunksBlob: [],
    chunksHash: ['hash in browser'],
    fileHash: 'hash in browser',
  })),
  processFileInNode: jest.fn(() => ({
    chunksHash: ['hash in node'],
    fileHash: 'hash in node',
  })),
}))

import * as is from '../../packages/shared/src/is'
import { getFileHashChunks } from '../../packages/core/src/get-file-hash-chunks'
import { HashChksParam } from '../../packages/core/src/interface'

function setBrowserEnv() {
  ;(is.isNode as jest.Mock).mockImplementation(() => false)
  ;(is.isBrowser as jest.Mock).mockImplementation(() => true)
}

function setNodeEnv() {
  ;(is.isNode as jest.Mock).mockImplementation(() => true)
  ;(is.isBrowser as jest.Mock).mockImplementation(() => false)
}

describe('getFileHashChunks', () => {
  it('should return getFileHashChunks result correctly in browser env', async () => {
    setBrowserEnv()
    const param = <HashChksParam>{
      file: new File([], 'test.pdf', {
        type: 'application/pdf',
      }),
    }
    const result = await getFileHashChunks(param)

    expect(result.merkleHash).toEqual('hash in browser')
    expect(result.metadata.name).toEqual('fakeFileName.txt')
  })

  it('should return getFileHashChunks result correctly in node env', async () => {
    setNodeEnv()
    const param = <HashChksParam>{
      filePath: 'dummyPath',
    }
    const result = await getFileHashChunks(param)

    expect(result.merkleHash).toEqual('hash in node')
    expect(result.metadata.name).toEqual('fakeFileName.txt')
  })
})
