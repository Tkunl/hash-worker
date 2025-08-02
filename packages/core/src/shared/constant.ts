import { md5, xxhash64, xxhash128 } from 'hash-wasm'
import { Strategy } from '../types'

export const DEFAULT_MAX_WORKERS = 8

export type HashStrategy = Strategy
export const HASH_FUNCTIONS = {
  [Strategy.md5]: md5,
  [Strategy.xxHash64]: xxhash64,
  [Strategy.xxHash128]: xxhash128,
} as const
