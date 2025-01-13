import { Strategy } from '../interface'
import { crc32, md5, xxhash64 } from 'hash-wasm'

export function getHashStrategy(strategy: Strategy) {
  if (strategy === Strategy.md5) return md5
  if (strategy === Strategy.crc32) return crc32
  if (strategy === Strategy.xxHash64) return xxhash64
  throw Error('Unknown strategy')
}
