import { getRootHashByChunks } from '../../src/getRootHashByChunks'

describe('getRootHashByChunks', () => {
  it('should return the root hash', async () => {
    const hashList = ['a']
    const result = await getRootHashByChunks(hashList)
    expect(result).toBe('a')
  })
})
