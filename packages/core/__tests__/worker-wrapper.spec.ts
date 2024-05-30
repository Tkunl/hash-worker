import test from 'ava'
import sinon from 'sinon'
// import { WorkerLabelsEnum } from '../src/enum'
import { StatusEnum, WorkerWrapper } from '../src/entity/worker-wrapper'

// 此处使用 globalThis 替代 global
globalThis.Worker = sinon.stub().returns({
  onmessage: () => {},
  onerror: () => {},
  postMessage: sinon.spy(),
  terminate: sinon.spy(),
}) as any

test('WorkerWrapper initializes with WAITING status', (t) => {
  const worker = new Worker('')
  const workerWrapper = new WorkerWrapper(worker)
  t.is(
    workerWrapper.status,
    StatusEnum.WAITING,
    'WorkerWrapper should be initialized with a WAITING status',
  )
})
