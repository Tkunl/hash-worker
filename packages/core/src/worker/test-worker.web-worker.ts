/// <reference lib="webworker" />

import { isBrowser2, isNode } from '../utils'
import { md5 } from 'hash-wasm'

if (isBrowser2()) {
  addEventListener('message', async ({ data }: any) => {
    console.log('received msg!!!')
    console.log(await md5('abc'))
    postMessage('msg from worker' + data)
  })
}

if (isNode()) {
  ;(async () => {
    const { parentPort } = await import('worker_threads')
    parentPort &&
      parentPort.on('message', async (message) => {
        console.log(await md5('abc'))
        parentPort.postMessage(message)
      })
  })()
}
