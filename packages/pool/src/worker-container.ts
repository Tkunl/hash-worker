/// <reference lib="webworker" />

import { isBrowser2, isNode } from 'shared-tools'
import { WorkerReq } from './types'

console.log('open new worker ...')

if (isBrowser2()) {
  addEventListener('message', async ({ data }: { data: WorkerReq }) => {
    const { fn, fnArgs, transferList } = data
    const res = await fn(...fnArgs)
    postMessage(res, [...(transferList ?? [])])
  })
}

if (isNode()) {
  ;(async () => {
    console.log('before getting worker_threads')
    const { parentPort } = await import('worker_threads')
    parentPort && console.log('added message Listeners for worker')
    parentPort &&
      parentPort.on('message', async (data: WorkerReq) => {
        // console.log('get WorkerReq in worker...', data)
        // let { fn, fnArgs, transferList } = data
        // eslint-disable-next-line prefer-const
        let { fn, fnArgs } = data
        fn = new Function(fn as unknown as string) as any
        console.log('fn', fn)
        console.log('fn()', fn('jqk'))
        console.log('fnString', fn.toString())
        const res = await fn('def')
        console.log('res in worker', res)
        // parentPort.postMessage(res, [...(transferList ?? [])])
        parentPort.postMessage({
          data: res,
        })
      })
  })()
}
