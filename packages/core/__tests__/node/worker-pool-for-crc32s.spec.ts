import { WorkerPoolForCrc32s } from '../../src/worker/worker-pool-for-crc32s'
import { isBrowser, isNode } from '../../src/utils'

class WorkerWrapper {
  status = 'WAITING'
  terminate = jest.fn()
  run = jest.fn(async () => 'mock result')
}

jest.mock('../../src/entity/worker-wrapper', () => new WorkerWrapper())
jest.mock('worker_threads', () => ({
  Worker: jest.fn(),
}))

describe('WorkerPoolForCrc32s', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('create function should initialize pool correctly in Node environment', async () => {
    console.log('isBrowser()....', isBrowser())
    console.log('isNode()....', isNode())
    const pool = await WorkerPoolForCrc32s.create(4)
    expect(pool.pool.length).toBe(4)
    expect(pool.pool[0] instanceof WorkerWrapper).toBe(true)
    expect((await import('worker_threads')).Worker).toHaveBeenCalledTimes(4)
  })
})
