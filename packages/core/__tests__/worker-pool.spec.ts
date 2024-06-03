import test from 'ava'
import { StatusEnum, WorkerWrapper } from '../src/entity/worker-wrapper'
import { MiniSubject } from '../src/utils'
import { WorkerPool } from '../src/entity/worker-pool'
import sinon from 'sinon'

// 模拟 WorkerWrapper
class MockWorkerWrapper extends WorkerWrapper {
  constructor() {
    super({
      terminate: () => {}
    } as Worker);
    this.status = StatusEnum.WAITING;
  }

  run<T>(param: ArrayBuffer, params: ArrayBuffer[], index: number) {
    return Promise.resolve('result' as unknown as T);
  }
}

// 模拟 MiniSubject
class MockMiniSubject<T> extends MiniSubject<T> {
  constructor(value: T) {
    super(value);
  }

  next(value: T) {
    this._value = value;
    this.subscribers.forEach((cb) => cb(value));
  }
}

// 扩展 WorkerPool 以使用模拟的 WorkerWrapper 和 MiniSubject
class TestWorkerPool extends WorkerPool {
  constructor(maxWorkers = 4) {
    super(maxWorkers);
    this.curRunningCount = new MockMiniSubject(0);
    for (let i = 0; i < maxWorkers; i++) {
      this.pool.push(new MockWorkerWrapper());
    }
  }
}

test('WorkerPool should execute tasks and return results', async t => {
  const workerPool = new TestWorkerPool(2);
  const params = [new ArrayBuffer(8), new ArrayBuffer(8)];

  const results = await workerPool.exec<string>(params);

  t.deepEqual(results, ['result', 'result']);
});

test('WorkerPool should terminate all workers', t => {
  const workerPool = new TestWorkerPool(2);
  const terminateSpies = workerPool.pool.map(worker => sinon.spy(worker, 'terminate'));

  workerPool.terminate();

  terminateSpies.forEach(spy => {
    t.true(spy.calledOnce);
  });
});
