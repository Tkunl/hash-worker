import { md5 } from 'hash-wasm'

// 定义 Merkle 树节点的接口
interface IMerkleNode {
  h: string
  l: IMerkleNode | null
  r: IMerkleNode | null
}

// 定义 Merkle 树的接口
interface IMerkleTree {
  root: IMerkleNode
  leafs: IMerkleNode[]
  // 你可以根据需要添加其他属性或方法，例如校验、添加和生成树等功能
}

// Merkle 树节点的类实现
export class MerkleNode implements IMerkleNode {
  h: string
  l: IMerkleNode | null
  r: IMerkleNode | null

  constructor(hash: string, left: IMerkleNode | null = null, right: IMerkleNode | null = null) {
    this.h = hash
    this.l = left
    this.r = right
  }
}

// Merkle 树的类实现
export class MerkleTree implements IMerkleTree {
  root: IMerkleNode = new MerkleNode('')
  leafs: IMerkleNode[] = []

  async init(hashList: string[]): Promise<void>
  async init(leafNodes: IMerkleNode[]): Promise<void>
  async init(nodes: string[] | IMerkleNode[]): Promise<void> {
    if (nodes.length === 0) {
      throw new Error('Empty Nodes')
    }
    if (typeof nodes[0] === 'string') {
      this.leafs = nodes.map((node) => new MerkleNode(node as string))
    } else {
      this.leafs = nodes as IMerkleNode[]
    }
    this.root = await this.buildTree()
  }

  getRootHash() {
    return this.root.h
  }

  async buildTree(): Promise<IMerkleNode> {
    // 实现构建 Merkle 树的逻辑。根据叶子节点创建父节点，一直到根节点。
    let currentLevelNodes = this.leafs
    while (currentLevelNodes.length > 1) {
      const parentNodes: IMerkleNode[] = []
      for (let i = 0; i < currentLevelNodes.length; i += 2) {
        const left = currentLevelNodes[i]
        const right = i + 1 < currentLevelNodes.length ? currentLevelNodes[i + 1] : null
        // 具体的哈希计算方法
        const parentHash = await this.calculateHash(left, right)
        parentNodes.push(new MerkleNode(parentHash, left, right))
      }
      currentLevelNodes = parentNodes
    }

    return currentLevelNodes[0] // 返回根节点
  }

  private async calculateHash(left: IMerkleNode, right: IMerkleNode | null): Promise<string> {
    return right ? md5(left.h + right.h) : left.h
  }
}
