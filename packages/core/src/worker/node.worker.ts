import { calculateHashInWorker } from '../shared'
import { parentPort } from 'worker_threads'

parentPort?.on('message', async (data) => {
  const res = await calculateHashInWorker(data)
  parentPort?.postMessage(res, [data.chunk])
})
