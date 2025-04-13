/// <reference lib="webworker" />

import { crc32, md5, xxhash64 } from 'hash-wasm'
import { Strategy, WorkerReq } from '../interface'
import { isBrowser2, isNode } from '../utils'

async function calculateHash(req: WorkerReq) {
  const { chunk: buf, strategy } = req

  let hash = ''
  // const u8 = new Uint8Array(buf)
  if (strategy === Strategy.md5) hash = await md5(new Uint8Array(buf))
  if (strategy === Strategy.crc32) hash = await crc32(new Uint8Array(buf))
  if (strategy === Strategy.xxHash64) hash = await xxhash64(new Uint8Array(buf))

  return {
    result: hash,
    chunk: req,
  }
}

if (isBrowser2()) {
  addEventListener('message', async ({ data }: { data: WorkerReq }) => {
    const res = await calculateHash(data)
    postMessage(res, [data.chunk])
  })
}

if (isNode()) {
  ;(async () => {
    const { parentPort } = await import('worker_threads')
    parentPort &&
      parentPort.on('message', async (data: WorkerReq) => {
        const res = await calculateHash(data)
        parentPort.postMessage(res, [data.chunk])
      })
  })()
}
