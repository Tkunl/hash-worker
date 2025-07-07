import { MerkleTree, MerkleNode, HashFn } from '../../../src/shared/merkleTree'

describe('MerkleTree', () => {
  describe('MerkleNode', () => {
    it('应该正确创建 MerkleNode', () => {
      const node = new MerkleNode('hash123')
      expect(node.h).toBe('hash123')
      expect(node.l).toBeNull()
      expect(node.r).toBeNull()
    })

    it('应该正确创建带有子节点的 MerkleNode', () => {
      const leftChild = new MerkleNode('leftHash')
      const rightChild = new MerkleNode('rightHash')
      const node = new MerkleNode('parentHash', leftChild, rightChild)

      expect(node.h).toBe('parentHash')
      expect(node.l).toBe(leftChild)
      expect(node.r).toBe(rightChild)
    })

    it('应该正确创建只有左子节点的 MerkleNode', () => {
      const leftChild = new MerkleNode('leftHash')
      const node = new MerkleNode('parentHash', leftChild)

      expect(node.h).toBe('parentHash')
      expect(node.l).toBe(leftChild)
      expect(node.r).toBeNull()
    })
  })

  describe('构造函数', () => {
    it('应该使用默认哈希函数创建 MerkleTree', () => {
      const tree = new MerkleTree()
      expect(tree.root).toBeInstanceOf(MerkleNode)
      expect(tree.leafs).toEqual([])
      expect(typeof tree.hashFn).toBe('function')
    })

    it('应该使用自定义哈希函数创建 MerkleTree', async () => {
      const customHashFn: HashFn = async (hLeft, hRight) => {
        return hRight ? `custom_${hLeft}_${hRight}` : hLeft
      }

      const tree = new MerkleTree(customHashFn)
      const result = await tree.hashFn('left', 'right')
      expect(result).toBe('custom_left_right')
    })
  })

  describe('init', () => {
    it('应该使用字符串数组初始化', async () => {
      const tree = new MerkleTree()
      const hashList = ['hash1', 'hash2', 'hash3', 'hash4']

      await tree.init(hashList)

      expect(tree.leafs).toHaveLength(4)
      expect(tree.leafs[0].h).toBe('hash1')
      expect(tree.leafs[1].h).toBe('hash2')
      expect(tree.leafs[2].h).toBe('hash3')
      expect(tree.leafs[3].h).toBe('hash4')
    })

    it('应该使用 MerkleNode 数组初始化', async () => {
      const tree = new MerkleTree()
      const nodes = [new MerkleNode('hash1'), new MerkleNode('hash2'), new MerkleNode('hash3')]

      await tree.init(nodes)

      expect(tree.leafs).toHaveLength(3)
      expect(tree.leafs[0].h).toBe('hash1')
      expect(tree.leafs[1].h).toBe('hash2')
      expect(tree.leafs[2].h).toBe('hash3')
    })

    it('当传入空数组时应该抛出错误', async () => {
      const tree = new MerkleTree()

      await expect(tree.init([])).rejects.toThrow('Empty Nodes')
    })

    it('当传入空字符串数组时应该抛出错误', async () => {
      const tree = new MerkleTree()

      await expect(tree.init([] as string[])).rejects.toThrow('Empty Nodes')
    })

    it('当传入空节点数组时应该抛出错误', async () => {
      const tree = new MerkleTree()

      await expect(tree.init([] as any[])).rejects.toThrow('Empty Nodes')
    })
  })

  describe('buildTree', () => {
    it('应该构建单个节点的树', async () => {
      const tree = new MerkleTree()
      await tree.init(['singleHash'])

      const root = await tree.buildTree()
      expect(root.h).toBe('singleHash')
      expect(root.l).toBeNull()
      expect(root.r).toBeNull()
    })

    it('应该构建两个节点的树', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2'])

      const root = await tree.buildTree()
      expect(root.h).toBeDefined()
      expect(root.l).toBe(tree.leafs[0])
      expect(root.r).toBe(tree.leafs[1])
    })

    it('应该构建三个节点的树（奇数个叶子节点）', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2', 'hash3'])

      const root = await tree.buildTree()
      expect(root.h).toBeDefined()
      expect(root.l).toBeDefined()
      expect(root.r).toBeDefined()
    })

    it('应该构建四个节点的树', async () => {
      const tree = new MerkleTree()
      await tree.init(['hash1', 'hash2', 'hash3', 'hash4'])

      const root = await tree.buildTree()
      expect(root.h).toBeDefined()
      expect(root.l).toBeDefined()
      expect(root.r).toBeDefined()
    })

    it('应该使用自定义哈希函数构建树', async () => {
      const customHashFn: HashFn = async (hLeft, hRight) => {
        return hRight ? `combined_${hLeft}_${hRight}` : hLeft
      }

      const tree = new MerkleTree(customHashFn)
      await tree.init(['hash1', 'hash2'])

      const root = await tree.buildTree()
      expect(root.h).toBe('combined_hash1_hash2')
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
      const result = await tree['calculateHash']({ left: 'left', right: 'right' })
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('应该处理只有左子节点的情况', async () => {
      const tree = new MerkleTree()
      const result = await tree['calculateHash']({ left: 'left' })
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
      expect(tree.root.l).toBeDefined()
      expect(tree.root.r).toBeDefined()
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
      expect(tree.root.l).toBeDefined()
      expect(tree.root.r).toBeDefined()

      // 验证叶子节点没有子节点
      expect(tree.leafs[0].l).toBeNull()
      expect(tree.leafs[0].r).toBeNull()
      expect(tree.leafs[1].l).toBeNull()
      expect(tree.leafs[1].r).toBeNull()
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
