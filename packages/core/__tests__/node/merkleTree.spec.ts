import { md5 } from 'hash-wasm'
import { MerkleTree } from '../../src/entity'

async function createHash(data: string): Promise<string> {
  return md5(data)
}

// 测试空数组初始化应该抛出错误
test('init() with empty array should throw an error', async () => {
  const tree = new MerkleTree()

  // 如果期望异步函数抛出错误，可以使用 expect(...).rejects.toThrow(...)
  await expect(tree.init([])).rejects.toThrow('Empty Nodes')
})

// 测试 MerkleTree.init 用字符串哈希列表初始化
test('MerkleTree.init with string hash list', async () => {
  // 创建一些测试用的哈希
  const hashList = [
    await createHash('data1'),
    await createHash('data2'),
    await createHash('data3'),
    await createHash('data4'),
  ]

  // 创建 MerkleTree 实例并初始化
  const merkleTree = new MerkleTree()
  await expect(merkleTree.init(hashList)).resolves.toBeUndefined() // 如果不期望具体的返回值，可以检查被调用函数是否成功被解决

  // 检查是否所有叶子节点都被正确创建
  expect(merkleTree.leafs.length).toBe(hashList.length)
  hashList.forEach((hash, index) => {
    expect(merkleTree.leafs[index].h).toBe(hash)
  })

  // 检查 root 是否被设置
  expect(merkleTree.root.h).toBeTruthy()
})
