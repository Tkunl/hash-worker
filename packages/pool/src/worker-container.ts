/// <reference lib="webworker" />

import { isBrowser2, isNode } from 'shared-tools'
import { WorkerReq } from './types'

if (isBrowser2()) {
  addEventListener('message', async ({ data }: { data: WorkerReq }) => {
    const { fn, params, transferList } = data
    const res = await fn(...params)
    postMessage(res, [...(transferList ?? [])])
  })
}

if (isNode()) {
  ;(async () => {
    const { parentPort } = await import('worker_threads')
    parentPort &&
      parentPort.on('message', async (data: WorkerReq) => {
        const { fn, params, transferList } = data
        const res = await fn(...params)
        parentPort.postMessage(res, [...(transferList ?? [])])
      })
  })()
}
