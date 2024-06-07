import { MerkleTree } from './entity'

export async function getRootHashByChunks(hashList: string[]) {
  const merkleTree = new MerkleTree()
  await merkleTree.init(hashList)
  return merkleTree.getRootHash()
}
