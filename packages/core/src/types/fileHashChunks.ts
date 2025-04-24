import { Strategy } from '.'
import { HashFn } from '../shared'

export interface Config {
  chunkSize?: number // 分片大小 MB
  workerCount?: number // worker 线程数量
  strategy?: Strategy // hash 计算策略
  borderCount?: number // 使用 'mixed' 时的分界点, 分片数量少于 borderCount 时使用 md5 作为 hash 算法, 否则使用 crc32
  isCloseWorkerImmediately?: boolean // 是否在计算 hash 后立即关闭 worker
  isShowLog?: boolean // 是否显示 log
  hashFn?: HashFn // 自定义 MerkleTree hash 合并方法
  hashFn2: any // TODO 待修改
}

export interface FileMetaInfo {
  name: string // 文件名
  size: number // 文件大小 KB
  lastModified: number // 时间戳
  type: string // 文件的后缀名
}

export interface HashChksRes {
  chunksBlob?: Blob[] // 文件分片的 Blob[]
  chunksHash: string[] // 文件分片的 Hash[]
  merkleHash: string // 文件的 merkleHash
  metadata: FileMetaInfo // 文件的 metadata
}

interface BaseParam {
  config?: Config
}
interface BrowserEnvParam extends BaseParam {
  file: File // 待计算 Hash 的文件 (浏览器环境)
  filePath?: never // 当 file 存在时，filePath 不能存在
}
interface NodeEnvParam extends BaseParam {
  file?: never // 当 filePath 存在时，file 不能存在
  filePath: string // 待计算 Hash 的文件的 URL (Node 环境)
}
/** 使用交叉类型确保 file 和 filePath 二者之一必须存在 */
export type HashChksParam = BrowserEnvParam | NodeEnvParam
