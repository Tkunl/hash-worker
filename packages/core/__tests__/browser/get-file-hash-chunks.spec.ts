import { getFileHashChunks } from '../../src/get-file-hash-chunks'

jest.mock('../../src/utils/is', () => ({
  isNode: jest.fn(() => false),
  isBrowser: jest.fn(() => false),
}))

jest.mock('../../src/worker/worker-service', () => ({
  WorkerService: jest.fn(() => ({
    terminate: jest.fn(),
  })),
}))

jest.mock('../../src/utils/file-utils', () => ({
  getFileMetadata: jest.fn(() => ({
    name: 'fakeFileName.txt',
  })),
}))

jest.mock('../../src/helper', () => ({
  ...jest.requireActual('../../src/helper'), // 从中导入所有原始实现
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

import * as is from '../../src/utils/is'
import { HashChksParam } from '../../src/interface'

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
