/// <reference lib="webworker" />

import { isBrowser2, isNode } from '../utils'
import { getHashStrategy } from '../utils/getHashStrategy'
import { WorkerReq } from '../interface'

async function calculateHash(req: WorkerReq) {
  const { chunk: buf, strategy } = req
  const hashFn = await getHashStrategy(strategy)
  const hash = await hashFn(new Uint8Array(buf))

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
