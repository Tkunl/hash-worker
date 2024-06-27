/// <reference lib="webworker" />

import { crc32 } from 'hash-wasm'
import { isBrowser2, isNode } from '../utils'

if (isBrowser2()) {
  addEventListener('message', async ({ data }: { data: ArrayBuffer }) => {
    const hash = await crc32(new Uint8Array(data))
    const res = {
      result: hash,
      chunk: data,
    }

    postMessage(res, [data])
  })
}

if (isNode()) {
  ;(async () => {
    const { parentPort } = await import('worker_threads')
    parentPort &&
      parentPort.on('message', async ({ data }: { data: ArrayBuffer }) => {
        const hash = await crc32(new Uint8Array(data))
        const res = {
          result: hash,
          chunk: data,
        }

        parentPort.postMessage(res, [data])
      })
  })()
}
