import { crc32, md5, xxhash64 } from 'hash-wasm'
import { Strategy } from '../types'

export const DEFAULT_MAX_WORKERS = 8
export const BORDER_COUNT = 100

export type HashStrategy = Exclude<Strategy, Strategy.mixed>
export const HASH_FUNCTIONS = {
  [Strategy.md5]: md5,
  [Strategy.crc32]: crc32,
  [Strategy.xxHash64]: xxhash64,
} as const
