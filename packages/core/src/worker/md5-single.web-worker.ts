/// <reference lib="webworker" />

import { WorkerMessage } from '../entity/worker-message'
import { WorkerLabelsEnum } from '../types/worker-labels.enum'
import { md5 } from 'hash-wasm'

/**
 * 简单的直接算文件的 md5
 */
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
