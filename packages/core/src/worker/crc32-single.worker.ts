/// <reference lib="webworker" />

import { crc32 } from 'hash-wasm'
import { WorkerMessage } from '../entity/worker-message'
import { WorkerLabelsEnum } from '../types/worker-labels.enum'

/**
 * 简单的直接算文件的 crc32
 */
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
