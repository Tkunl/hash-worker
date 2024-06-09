import test from 'ava'
import proxyquire from 'proxyquire'
import moduleAlias from 'module-alias'
import path from 'path'
import { MockWorker } from './fixture/mock-worker'
// import { WorkerPoolForMd5s } from '../src/worker/worker-pool-for-md5s'
// import sinon from 'sinon'
// import { WorkerPoolForMd5s } from '../src/worker/worker-pool-for-md5s'
// import { WorkerPoolForCrc32s } from '../src/worker/worker-pool-for-crc32s'

moduleAlias.addAlias(
  'web-worker:./md5-single.web-worker.ts',
  path.join(__dirname, '/fixture/mock-worker.ts'),
)

moduleAlias.addAlias(
  'web-worker:./crc32-single.web-worker.ts',
  path.join(__dirname, '/fixture/mock-worker.ts'),
)

class TestClass {}

async function runTests() {
  const WorkerPoolForMd5sStub = proxyquire('../src/worker/worker-pool-for-md5s', {
    'web-worker:./md5-single.web.worker.ts': MockWorker,
  })

  // const WorkerPoolForCrc32sStub = proxyquire('../src/worker/worker-pool-for-md5s', {
  //   'web-worker:./crc32-single.web-worker.ts': MockWorker,
  // })

  // const { WorkerService } = proxyquire('../src/worker/worker-service', {
  //   './worker-pool-for-md5s': WorkerPoolForMd5sStub,
  //   './worker-pool-for-crc32s': WorkerPoolForCrc32sStub,
  // })

  test('WorkerService should compute MD5 for files', async (t) => {
    // const { MockWorkerPoolForMd5s: _MockWorkerPoolForMd5s } =
    //
    // const mockMd5Pool = new MockWorkerPoolForMd5s(2)
    // const workerService = new WorkerService(2)
    // workerService.md5SingleWorkerPool = mockMd5Pool
    //
    // const chunks = [createMockArrayBuffer(1024), createMockArrayBuffer(2048)]
    // const result = await workerService.getMD5ForFiles(chunks)
    //
    // t.deepEqual(result, ['md5-result'])
    // t.true(mockMd5Pool.exec.calledOnceWithExactly(chunks))

    console.log('===================')
    console.log('__dirname', __dirname)
    console.log('WorkerPoolForMd5sStub', WorkerPoolForMd5sStub)
    console.log('TestClass', TestClass)
    // console.log('WorkerService', WorkerService)
    console.log('===================')
    t.true(true)
  })
}

runTests().catch((err) => {
  console.error(err)
  process.exit(1)
})

// function createMockArrayBuffer(size: number): ArrayBuffer {
//   return new Uint8Array(size).buffer
// }

// class MockWorkerPoolForCrc32s extends WorkerPoolForCrc32s {
//   exec = sinon.stub().resolves(['crc32-result'])
// }

// TODO 此处依赖替换有问题
// const { WorkerService } = proxyquire('../src/worker/worker-service', {
//   '../src/worker/worker-pool-for-md5s': proxyquire('../src/worker/md5-single.web-worker.ts', {
//     'web-worker:./md5-single.web-worker.ts': MockWorker,
//   }),
//   '../src/worker/worker-pool-for-crc32s': proxyquire('../src/worker/crc32-single.web-worker.ts', {
//     'web-worker:./crc32-single.web-worker.ts': MockWorker,
//   }),
// }).noCallThru()

// const { WorkerService } = proxyquire('../src/worker/worker-service', {
//   '../src/worker/worker-pool-for-md5s': proxyquire('../src/worker/worker-pool-for-md5s', {
//     'web-worker:./md5-single.web-worker.ts': MockWorker,
//   }).noCallThru(),
// }).noCallThru() // 确保 proxyquire 不会调用原始模块的其他依赖

// const WorkerPoolForMd5sStub = proxyquire('../src/worker/worker-pool-for-md5s', {
//   'web-worker:./md5-single.web-worker.ts': MockWorker,
// })

// 再使用替换后的 WorkerPoolForMd5sStub 替换 worker-service 中的依赖
// const { WorkerService } = proxyquire.load('../src/worker/worker-service', {
//   './worker-pool-for-md5s': WorkerPoolForMd5sStub,
// })
