import { calculateHash } from '../shared'
import { parentPort } from 'worker_threads'

parentPort?.on('message', async (data) => {
  const res = await calculateHash(data)
  parentPort?.postMessage(res, [data.chunk])
})
