/// <reference lib="webworker" />

import { WorkerMessage } from '../entity'
import { WorkerLabelsEnum } from '../enum'
import { md5 } from 'hash-wasm'

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
