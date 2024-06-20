import { MockWebWorker } from '../fixture/mock-web-worker'
import { WorkerPoolForMd5 } from '../../src/worker/worker-pool-for-md5'

// 模拟浏览器下的 Web Worker
;(global as any).Worker = MockWebWorker

// 模拟 Node.js 下的 worker_threads
jest.mock('worker_threads', () => ({
  Worker: jest.fn(),
}))

describe('WorkerPoolForMd5s', () => {
  test('create function should initialize pool correctly in Node environment', async () => {
    const pool = await WorkerPoolForMd5.create(4)
    expect(pool.pool.length).toBe(4)
    expect((await import('worker_threads')).Worker).toHaveBeenCalledTimes(4)
  })
})
