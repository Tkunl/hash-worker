import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'
import { WorkerPoolForMd5s } from '../src/worker/worker-pool-for-md5s'
import { WorkerPoolForCrc32s } from '../src/worker/worker-pool-for-crc32s'

function createMockArrayBuffer(size: number): ArrayBuffer {
  return new Uint8Array(size).buffer
}

// 模拟 WorkerPoolForMd5s 和 WorkerPoolForCrc32s
class MockWorkerPoolForMd5s extends WorkerPoolForMd5s {
  exec = sinon.stub().resolves(['md5-result'])
}

class MockWorkerPoolForCrc32s extends WorkerPoolForCrc32s {
  exec = sinon.stub().resolves(['crc32-result'])
}

const MockWorker = class {
  postMessage = sinon.stub()
  terminate = sinon.stub()
}

// TODO 此处依赖替换有问题
const { WorkerService } = proxyquire('../src/worker/worker-service', {
  '../src/worker/worker-pool-for-md5s': proxyquire('./../src/worker/md5-single.web-worker.ts', {
    'web-worker:./md5-single.web-worker.ts': MockWorker,
  }),
  '../src/worker/worker-pool-for-crc32s': proxyquire('./../src/worker/crc32-single.web-worker.ts', {
    'web-worker:./crc32-single.web-worker.ts': MockWorker,
  }),
}).noCallThru()

test('WorkerService should compute MD5 for files', async (t) => {
  const mockMd5Pool = new MockWorkerPoolForMd5s(2)
  const workerService = new WorkerService(2)
  workerService.md5SingleWorkerPool = mockMd5Pool

  const chunks = [createMockArrayBuffer(1024), createMockArrayBuffer(2048)]
  const result = await workerService.getMD5ForFiles(chunks)

  t.deepEqual(result, ['md5-result'])
  t.true(mockMd5Pool.exec.calledOnceWithExactly(chunks))
})
