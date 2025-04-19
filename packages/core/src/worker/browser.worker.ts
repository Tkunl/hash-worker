/// <reference lib="webworker" />
import { calculateHashInWorker } from '../shared'

addEventListener('message', async ({ data }) => {
  const res = await calculateHashInWorker(data)
  postMessage(res, [data.chunk])
})
