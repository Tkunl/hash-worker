/// <reference lib="webworker" />

import { md5 } from 'hash-wasm'
import { WorkerMessage } from '../entity'
import { WorkerLabelsEnum } from '../enum'
import { generateUUID, isBrowser2, isNode } from '../utils'

const workerId = generateUUID()
console.log('workerId', workerId)

if (isBrowser2()) {
  addEventListener('message', async ({ data }: { data: ArrayBuffer }) => {
    const hash = await md5(new Uint8Array(data))

    postMessage(
      new WorkerMessage(WorkerLabelsEnum.DONE, {
        result: hash,
        chunk: data,
      }),
      [data],
    )
  })
}

if (isNode()) {
  ;(async () => {
    const { parentPort } = await import('worker_threads')
    parentPort &&
      parentPort.on('message', async ({ data }: { data: ArrayBuffer }) => {
        const hash = await md5(new Uint8Array(data))

        // TODO 此处可能存在问题 ....
        parentPort.postMessage(
          new WorkerMessage(WorkerLabelsEnum.DONE, {
            result: hash,
            chunk: data,
          }),
          [data],
        )
      })
  })()
}
