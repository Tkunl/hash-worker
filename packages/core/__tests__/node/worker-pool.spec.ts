import { MockWorkerPool } from '../fixture/mock-worker-pool'

describe('WorkerPool', () => {
  // 测试 WorkerPool 是否能够执行任务并返回结果
  test('should execute tasks and return results', async () => {
    const workerPool = new MockWorkerPool(2)
    const params = [new ArrayBuffer(8), new ArrayBuffer(8)]

    const getFn = (param: ArrayBuffer) => param
    const restoreFn: any = () => {}

    const results = await workerPool.exec<string, ArrayBuffer>(params, getFn, restoreFn)

    // 使用 Jest 的 toEqual 进行深度比较
    expect(results).toEqual(['result', 'result'])
  })

  // 测试 WorkerPool 是否能够正确地终止所有 workers
  test('should terminate all workers', () => {
    const workerPool = new MockWorkerPool(2)
    // 使用 jest.spyOn 为每个 worker 的 terminate 方法设置监视
    const terminateSpies = workerPool.pool.map((worker) => jest.spyOn(worker, 'terminate'))

    workerPool.terminate()

    // 检查每个 spy 是否被调用了一次
    terminateSpies.forEach((spy) => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  test('should execute tasks and return results', async () => {
    const workerPool = new MockWorkerPool(2)
    const params = [new ArrayBuffer(8), new ArrayBuffer(8)]

    const getFn = (param: ArrayBuffer) => param
    const restoreFn: any = () => {}

    const results = await workerPool.exec<string, ArrayBuffer>(params, getFn, restoreFn)

    expect(results).toEqual(['result', 'result'])
  })

  test('should terminate all workers', () => {
    const workerPool = new MockWorkerPool(2)

    // 使用 Jest 的 mock 函数来模拟 terminate 方法
    workerPool.pool.forEach((worker) => {
      worker.terminate = jest.fn()
    })

    workerPool.terminate()

    // 检查每个 worker 的 terminate 方法是否被调用了一次
    workerPool.pool.forEach((worker) => {
      expect(worker.terminate).toHaveBeenCalledTimes(1)
    })
  })
})
