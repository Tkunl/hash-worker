import { FileMetaInfo } from './file-meta-info'
import { Strategy } from '../enum'

export interface FileHashChunksParam {
  file: File // 待计算 Hash 的文件
  chunkSize?: number // 分片大小 MB
  maxWorkerCount?: number // worker 线程数量
  strategy?: Strategy // hash 计算策略
  borderCount?: number // 使用 'mixed' 时的分界点, 分片数量少于 borderCount 时使用 md5 作为 hash 算法, 否则使用 crc32
}

export interface FileHashChunksResult {
  chunksBlob: Blob[] // 文件分片的 Blob[]
  chunksHash: string[] // 文件分片的 Hash[]
  merkleHash: string // 文件的 merkleHash
  metadata: FileMetaInfo // 文件的 metadata
}
