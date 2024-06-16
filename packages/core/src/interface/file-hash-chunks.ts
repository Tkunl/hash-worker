import { FileMetaInfo } from './file-meta-info'
import { Strategy } from '../enum'

type RequiredDeep<T> = {
  [P in keyof T]-?: T[P] extends object ? RequiredDeep<T[P]> : T[P]
}
type RequiredConfig = Required<Pick<HashChksParam, 'config'>>
type FullyRequiredConfig = {
  [K in keyof RequiredConfig]: RequiredDeep<RequiredConfig[K]>
}

/**
 * Node 环境下的参数
 */
export type NodeHashChksParam = Required<Pick<HashChksParam, 'filePath'>> &
  Omit<HashChksParam, 'filePath' | 'config'> &
  FullyRequiredConfig

/**
 * 浏览器环境下的参数
 */
export type BrowserHashChksParam = Required<Pick<HashChksParam, 'file'>> &
  Omit<HashChksParam, 'file' | 'config'> &
  FullyRequiredConfig

export interface Config {
  chunkSize?: number // 分片大小 MB
  workerCount?: number // worker 线程数量
  strategy?: Strategy // hash 计算策略
  borderCount?: number // 使用 'mixed' 时的分界点, 分片数量少于 borderCount 时使用 md5 作为 hash 算法, 否则使用 crc32
  isCloseWorkerImmediately?: boolean // 是否在计算 hash 后立即关闭 worker
}

export interface HashChksParam {
  file?: File // 待计算 Hash 的文件 (浏览器环境)
  filePath?: string // 待计算 Hash 的文件的 URL (Node 环境)
  config?: Config
}

export interface HashChksRes {
  chunksBlob?: Blob[] // 文件分片的 Blob[]
  chunksHash: string[] // 文件分片的 Hash[]
  merkleHash: string // 文件的 merkleHash
  metadata: FileMetaInfo // 文件的 metadata
}
