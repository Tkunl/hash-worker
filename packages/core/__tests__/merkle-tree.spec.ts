import test from 'ava'
import { md5 } from 'hash-wasm'
import { MerkleTree } from '../src/entity'

async function createHash(data: string): Promise<string> {
  return md5(data)
}

test('init() with empty array should throw an error', async (t) => {
  const tree = new MerkleTree()
  const error = await t.throwsAsync(async () => {
    await tree.init([])
  })
  t.is(error.message, 'Empty Nodes', 'Should throw "Empty Nodes" error')
})

test('MerkleTree.init with string hash list', async (t) => {
  // 创建一些测试用的哈希
  const hashList = [
    await createHash('data1'),
    await createHash('data2'),
    await createHash('data3'),
    await createHash('data4'),
  ]

  // 创建 MerkleTree 实例并初始化
  const merkleTree = new MerkleTree()
  await merkleTree.init(hashList)

  // 检查是否所有叶子节点都被正确创建
  t.is(merkleTree.leafs.length, hashList.length)
  hashList.forEach((hash, index) => {
    t.is(merkleTree.leafs[index].h, hash)
  })

  // 检查 root 是否被设置
  t.truthy(merkleTree.root.h)
})
