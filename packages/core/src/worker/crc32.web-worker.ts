/// <reference lib="webworker" />

import { WorkerMessage } from '../entity'
import { WorkerLabelsEnum } from '../enum'
import { crc32 } from 'hash-wasm'

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
