export interface FileMetaInfo {
  name: string // 文件名
  size: number // 文件大小 KB
  lastModified: number // 时间戳
  type: string // MIME 类型, 例 image/jpeg, text/html 等
}
