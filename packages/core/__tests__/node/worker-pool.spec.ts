// 使用 jest.mock() 或 jest.spyOn() 来模拟外部依赖，这里需要先构建好 Mock 类
// 假设所有的类定义和必要的导入已经正确完成

// 扩展 WorkerPool 以使用模拟的 WorkerWrapper 和 MiniSubject
import { StatusEnum, WorkerPool, WorkerWrapper } from '../../src/entity'
import { MiniSubject } from '../../src/utils'

class MockWorkerWrapper extends WorkerWrapper {
  constructor() {
    super({
      terminate: () => {},
    } as Worker)
    this.status = StatusEnum.WAITING
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run<T>(param: ArrayBuffer, params: ArrayBuffer[], index: number) {
    return Promise.resolve('result' as unknown as T)
  }
}

class TestWorkerPool extends WorkerPool {
  constructor(maxWorkers = 4) {
    super(maxWorkers)
    this.curRunningCount = new MockMiniSubject(0)
    for (let i = 0; i < maxWorkers; i++) {
      this.pool.push(new MockWorkerWrapper())
    }
  }
}

class MockMiniSubject<T> extends MiniSubject<T> {
  constructor(value: T) {
    super(value)
  }

  next(value: T) {
    this._value = value
    this.subscribers.forEach((cb) => cb(value))
  }
}

describe('WorkerPool Tests', () => {
  // 测试 WorkerPool 是否能够执行任务并返回结果
  test('WorkerPool should execute tasks and return results', async () => {
    const workerPool = new TestWorkerPool(2)
    const params = [new ArrayBuffer(8), new ArrayBuffer(8)]

    const results = await workerPool.exec<string>(params)

    // 使用 Jest 的 toEqual 进行深度比较
    expect(results).toEqual(['result', 'result'])
  })

  // 测试 WorkerPool 是否能够正确地终止所有 workers
  test('WorkerPool should terminate all workers', () => {
    const workerPool = new TestWorkerPool(2)
    // 使用 jest.spyOn 为每个 worker 的 terminate 方法设置监视
    const terminateSpies = workerPool.pool.map((worker) => jest.spyOn(worker, 'terminate'))

    workerPool.terminate()

    // 检查每个 spy 是否被调用了一次
    terminateSpies.forEach((spy) => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
