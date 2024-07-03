import { getRootHashByChunks } from '../../packages/core/src/get-root-hash-by-chunks'

describe('getRootHashByChunks', () => {
  it('should return the root hash', async () => {
    const hashList = ['a']
    const result = await getRootHashByChunks(hashList)
    expect(result).toBe('a')
  })
})
