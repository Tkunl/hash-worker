import { MerkleTree, MerkleNode, HashFn } from '../../../src/shared/merkleTree'

describe('MerkleTree', () => {
  describe('MerkleNode', () => {
    it('应该正确创建 MerkleNode', () => {
      const node = new MerkleNode('hash123')
      expect(node.hash).toBe('hash123')
      expect(node.left).toBeNull()
      expect(node.right).toBeNull()
    })

    it('应该正确创建带有子节点的 MerkleNode', () => {
      const leftChild = new MerkleNode('leftHash')
      const rightChild = new MerkleNode('rightHash')
      const node = new MerkleNode('parentHash', leftChild, rightChild)

      expect(node.hash).toBe('parentHash')
      expect(node.left).toBe(leftChild)
      expect(node.right).toBe(rightChild)
    })

    it('应该正确创建只有左子节点的 MerkleNode', () => {
      const leftChild = new MerkleNode('leftHash')
      const node = new MerkleNode('parentHash', leftChild)

      expect(node.hash).toBe('parentHash')
      expect(node.left).toBe(leftChild)
      expect(node.right).toBeNull()
    })
  })

  describe('构造函数', () => {
    it('应该使用默认哈希函数创建 MerkleTree', () => {
      const tree = new MerkleTree()
      expect(tree.leafs).toEqual([])
    })

    it('应该使用自定义哈希函数创建 MerkleTree', async () => {
      const customHashFn: HashFn = async (hLeft, hRight) => {
        return hRight ? `custom_${hLeft}_${hRight}` : hLeft
      }

      const tree = new MerkleTree(customHashFn)
      await tree.init(['hash1', 'hash2'])
      const result = tree.getRootHash()
      expect(result).toBe('custom_hash1_hash2')
    })
  })

  describe('init', () => {
    it('应该使用字符串数组初始化', async () => {
      const tree = new MerkleTree()
      const hashList = ['hash1', 'hash2', 'hash3', 'hash4']

      await tree.init(hashList)

      expect(tree.leafs).toHaveLength(4)
      expect(tree.leafs[0].hash).toBe('hash1')
      expect(tree.leafs[1].hash).toBe('hash2')
      expect(tree.leafs[2].hash).toBe('hash3')
      expect(tree.leafs[3].hash).toBe('hash4')
    })

    it('应该使用 MerkleNode 数组初始化', async () => {
      const tree = new MerkleTree()
      const nodes = [new MerkleNode('hash1'), new MerkleNode('hash2'), new MerkleNode('hash3')]

      await tree.init(nodes)

      expect(tree.leafs).toHaveLength(3)
      expect(tree.leafs[0].hash).toBe('hash1')
      expect(tree.leafs[1].hash).toBe('hash2')
      expect(tree.leafs[2].hash).toBe('hash3')
    })

    it('当传入空数组时应该抛出错误', async () => {
      const tree = new MerkleTree()

      await expect(tree.init([])).rejects.toThrow('无法使用空输入创建 Merkle 树')
    })

    it('当传入空字符串数组时应该抛出错误', async () => {
      const tree = new MerkleTree()

      await expect(tree.init([] as string[])).rejects.toThrow('无法使用空输入创建 Merkle 树')
    })

    it('当传入空节点数组时应该抛出错误', async () => {
      const tree = new MerkleTree()

      await expect(tree.init([] as any[])).rejects.toThrow('无法使用空输入创建 Merkle 树')
    })
  })

  describe('树构建', () => {
    it('应该构建单个节点的树', async () => {
      const tree = new MerkleTree()
      await tree.init(['singleHash'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBe('singleHash')
      expect(tree.root.left).toBeNull()
      expect(tree.root.right).toBeNull()
    })

    it('应该构建两个节点的树', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBeDefined()
      expect(tree.root.left).toBe(tree.leafs[0])
      expect(tree.root.right).toBe(tree.leafs[1])
    })

    it('应该构建三个节点的树（奇数个叶子节点）', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2', 'hash3'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBeDefined()
      expect(tree.root.left).toBeDefined()
      expect(tree.root.right).toBeDefined()
    })

    it('应该构建四个节点的树', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2', 'hash3', 'hash4'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBeDefined()
      expect(tree.root.left).toBeDefined()
      expect(tree.root.right).toBeDefined()
    })

    it('应该使用自定义哈希函数构建树', async () => {
      const customHashFn: HashFn = async (hLeft, hRight) => {
        return hRight ? `combined_${hLeft}_${hRight}` : hLeft
      }

      const tree = new MerkleTree(customHashFn)
      await tree.init(['hash1', 'hash2'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBe('combined_hash1_hash2')
    })
  })

  describe('getRootHash', () => {
    it('应该返回根节点的哈希值', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBeDefined()
      expect(typeof rootHash).toBe('string')
    })

    it('应该返回单个节点的哈希值', async () => {
      const tree = new MerkleTree()
      await tree.init(['singleHash'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBe('singleHash')
    })
  })

  describe('calculateHash', () => {
    it('应该使用默认哈希函数计算哈希', async () => {
      const tree = new MerkleTree()
      const result = await tree['calculateHash']({ leftHash: 'left', rightHash: 'right' })
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('应该处理只有左子节点的情况', async () => {
      const tree = new MerkleTree()
      const result = await tree['calculateHash']({ leftHash: 'left' })
      expect(result).toBe('left')
    })
  })

  describe('集成测试', () => {
    it('应该完整构建和验证 Merkle 树', async () => {
      const tree = new MerkleTree()
      const hashList = ['a', 'b', 'c', 'd']

      await tree.init(hashList)

      expect(tree.leafs).toHaveLength(4)
      expect(tree.getRootHash()).toBeDefined()
      expect(tree.root.left).toBeDefined()
      expect(tree.root.right).toBeDefined()
    })

    it('应该处理大量节点的树构建', async () => {
      const tree = new MerkleTree()
      const hashList = Array.from({ length: 8 }, (_, i) => `hash${i}`)

      await tree.init(hashList)

      expect(tree.leafs).toHaveLength(8)
      expect(tree.getRootHash()).toBeDefined()
    })

    it('应该使用自定义哈希函数进行完整测试', async () => {
      const customHashFn: HashFn = async (hLeft, hRight) => {
        return hRight ? `${hLeft}+${hRight}` : hLeft
      }

      const tree = new MerkleTree(customHashFn)
      await tree.init(['a', 'b', 'c'])

      const rootHash = tree.getRootHash()
      expect(rootHash).toBeDefined()
      expect(rootHash).toContain('+')
    })

    it('应该验证树的层级结构', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2', 'hash3', 'hash4'])

      // 验证根节点有左右子节点
      expect(tree.root.left).toBeDefined()
      expect(tree.root.right).toBeDefined()

      // 验证叶子节点没有子节点
      expect(tree.leafs[0].left).toBeNull()
      expect(tree.leafs[0].right).toBeNull()
      expect(tree.leafs[1].left).toBeNull()
      expect(tree.leafs[1].right).toBeNull()
    })
  })

  describe('边界情况', () => {
    it('应该处理只有一个叶子节点的情况', async () => {
      const tree = new MerkleTree()
      await tree.init(['single'])

      expect(tree.leafs).toHaveLength(1)
      expect(tree.getRootHash()).toBe('single')
    })

    it('应该处理奇数个叶子节点的情况', async () => {
      const tree = new MerkleTree()
      await tree.init(['a', 'b', 'c'])

      expect(tree.leafs).toHaveLength(3)
      expect(tree.getRootHash()).toBeDefined()
    })

    it('应该处理大量奇数个叶子节点', async () => {
      const tree = new MerkleTree()
      const hashList = Array.from({ length: 7 }, (_, i) => `hash${i}`)

      await tree.init(hashList)

      expect(tree.leafs).toHaveLength(7)
      expect(tree.getRootHash()).toBeDefined()
    })
  })
})
