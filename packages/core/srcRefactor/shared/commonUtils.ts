import { MerkleTree } from '.'

/**
 * [1, 2, 3, 4] => [[1, 2], [3, 4]]
 * @param chunks 原始数组
 * @param size 分 part 大小
 */
export function getArrParts<T>(chunks: T[], size: number) {
  const result: T[][] = []
  let tempPart: T[] = []
  chunks.forEach((chunk: T) => {
    tempPart.push(chunk)
    if (tempPart.length === size) {
      result.push(tempPart)
      tempPart = []
    }
  })
  if (tempPart.length !== 0) result.push(tempPart)
  return result
}

export function generateUUID(): string {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function getMerkleRootHashByChunks(hashList: string[]) {
  const merkleTree = new MerkleTree()
  await merkleTree.init(hashList)
  return merkleTree.getRootHash()
}
