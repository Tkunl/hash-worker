/// <reference lib="webworker" />

import { crc32 } from 'hash-wasm'
import { WorkerMessage } from '../entity'
import { WorkerLabelsEnum } from '../enum'
import { isBrowser2, isNode } from '../utils'

if (isBrowser2()) {
  addEventListener('message', async ({ data }: { data: ArrayBuffer }) => {
    const hash = await crc32(new Uint8Array(data))

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
        const hash = await crc32(new Uint8Array(data))

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
