/// <reference lib="webworker" />
import { calculateHash } from '../shared'

addEventListener('message', async ({ data }) => {
  const res = await calculateHash(data)
  postMessage(res, [data.chunk])
})
