import { md5 } from 'hash-wasm'

/**
 * 表示 Merkle 树中的节点
 */
interface IMerkleNode {
  /** 节点的哈希值 */
  hash: string
  /** 左子节点 */
  left: IMerkleNode | null
  /** 右子节点 */
  right: IMerkleNode | null
}

/**
 * 表示完整的 Merkle 树结构
 */
interface IMerkleTree {
  /** 树的根节点 */
  root: IMerkleNode
  /** 树的叶子节点 */
  leafs: IMerkleNode[]
}

/**
 * Merkle 树节点的实现
 */
export class MerkleNode implements IMerkleNode {
  hash: string
  left: IMerkleNode | null
  right: IMerkleNode | null

  constructor(hash: string, left: IMerkleNode | null = null, right: IMerkleNode | null = null) {
    if (!hash || typeof hash !== 'string') {
      throw new Error('哈希值必须是非空字符串')
    }
    this.hash = hash
    this.left = left
    this.right = right
  }
}

/**
 * 用于组合两个哈希值的哈希函数类型
 */
export type HashFn = (leftHash: string, rightHash?: string) => Promise<string>

/**
 * Merkle 树的实现
 */
export class MerkleTree implements IMerkleTree {
  root: IMerkleNode = new MerkleNode('')
  leafs: IMerkleNode[] = []
  private hashFn: HashFn = async (leftHash, rightHash?) =>
    rightHash ? await md5(leftHash + rightHash) : leftHash

  constructor(hashFn?: HashFn) {
    if (hashFn) {
      this.hashFn = hashFn
    }
  }

  /**
   * 使用哈希字符串初始化树
   */
  async init(hashList: string[]): Promise<void>
  /**
   * 使用现有节点初始化树
   */
  async init(leafNodes: IMerkleNode[]): Promise<void>
  async init(nodes: string[] | IMerkleNode[]): Promise<void> {
    if (!Array.isArray(nodes)) {
      throw new Error('输入必须是数组')
    }

    if (nodes.length === 0) {
      throw new Error('无法使用空输入创建 Merkle 树')
    }

    // 验证输入数据
    if (typeof nodes[0] === 'string') {
      const hashStrings = nodes as string[]
      this.validateHashStrings(hashStrings)
      this.leafs = hashStrings.map((hash) => new MerkleNode(hash))
    } else {
      const nodeArray = nodes as IMerkleNode[]
      this.validateNodes(nodeArray)
      this.leafs = [...nodeArray] // 创建副本以避免外部修改
    }

    this.root = await this.buildTree()
  }

  /**
   * 获取树的根哈希值
   */
  getRootHash(): string {
    return this.root.hash
  }

  /**
   * 从叶子节点构建 Merkle 树
   */
  private async buildTree(): Promise<IMerkleNode> {
    if (this.leafs.length === 0) {
      throw new Error('无法在没有叶子节点的情况下构建树')
    }

    let currentLevelNodes = [...this.leafs] // 使用副本进行操作

    while (currentLevelNodes.length > 1) {
      const parentNodes: IMerkleNode[] = []

      for (let i = 0; i < currentLevelNodes.length; i += 2) {
        const leftNode = currentLevelNodes[i]
        const rightNode = i + 1 < currentLevelNodes.length ? currentLevelNodes[i + 1] : null

        try {
          const parentHash = await this.calculateHash({
            leftHash: leftNode.hash,
            rightHash: rightNode?.hash,
          })
          parentNodes.push(new MerkleNode(parentHash, leftNode, rightNode))
        } catch (error) {
          throw new Error(`计算父节点哈希失败: ${error}`)
        }
      }

      currentLevelNodes = parentNodes
    }

    return currentLevelNodes[0]
  }

  /**
   * 计算父节点的哈希值
   */
  private async calculateHash({
    leftHash,
    rightHash,
  }: {
    leftHash: string
    rightHash?: string
  }): Promise<string> {
    try {
      return await this.hashFn(leftHash, rightHash)
    } catch (error) {
      throw new Error(`哈希计算失败: ${error}`)
    }
  }

  /**
   * 验证哈希字符串数组
   */
  private validateHashStrings(hashes: string[]): void {
    for (let i = 0; i < hashes.length; i++) {
      if (!hashes[i] || typeof hashes[i] !== 'string') {
        throw new Error(`索引 ${i} 处的哈希值无效: 必须是非空字符串`)
      }
    }
  }

  /**
   * 验证节点数组
   */
  private validateNodes(nodes: IMerkleNode[]): void {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node || !node.hash || typeof node.hash !== 'string') {
        throw new Error(`索引 ${i} 处的节点无效: 必须具有有效的 hash 属性`)
      }
    }
  }
}
