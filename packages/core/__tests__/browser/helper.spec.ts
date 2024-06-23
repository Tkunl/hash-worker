jest.mock('../../src/utils/is', () => ({
  isNode: jest.fn(() => false),
  isBrowser: jest.fn(() => false),
}))

import { normalizeParam } from '../../src/helper'
import * as is from '../../src/utils/is'

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
