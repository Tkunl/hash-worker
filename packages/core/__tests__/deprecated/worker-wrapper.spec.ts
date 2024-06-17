// import test from 'ava'
// import sinon from 'sinon'
// import { StatusEnum, WorkerWrapper } from '../src/entity'
// import { WorkerLabelsEnum } from '../src/enum'
//
// // 此处使用 globalThis 替代 global
// globalThis.Worker = sinon.stub().returns({
//   onmessage: () => {},
//   onerror: () => {},
//   postMessage: sinon.spy(),
//   terminate: sinon.spy(),
// }) as any
//
// test('WorkerWrapper initializes with WAITING status', (t) => {
//   const worker = new Worker('')
//   const workerWrapper = new WorkerWrapper(worker)
//   t.is(
//     workerWrapper.status,
//     StatusEnum.WAITING,
//     'WorkerWrapper should be initialized with a WAITING status',
//   )
// })
//
// test('WorkerWrapper changes status to RUNNING when run is called', async (t) => {
//   // We create a new Worker instance using our mocked global.Worker
//   const worker = new Worker('')
//   const workerWrapper = new WorkerWrapper(worker)
//
//   // We call the run method, which should change the status immediately
//   workerWrapper.run(new ArrayBuffer(1), [new ArrayBuffer(5)], 0)
//   t.is(
//     workerWrapper.status,
//     StatusEnum.RUNNING,
//     'WorkerWrapper status should be RUNNING after calling run',
//   )
// })
//
// // test('WorkerWrapper run resolves with correct data', async (t) => {
// //   const worker = new Worker('')
// //   const workerWrapper = new WorkerWrapper(worker)
// //
// //   // Simulate the worker finishing its job
// //   setTimeout(
// //     () =>
// //       worker.onmessage &&
// //       worker.onmessage({
// //         data: {
// //           label: WorkerLabelsEnum.DONE,
// //           content: {
// //             result: 'processed data',
// //             chunk: new ArrayBuffer(2),
// //           },
// //         },
// //       } as any),
// //     50,
// //   )
// //
// //   // We store the return value of the run command
// //   const result = await workerWrapper.run(new ArrayBuffer(1), [new ArrayBuffer(5)], 0)
// //   t.is(result, 'processed data', 'WorkerWrapper run should resolve with the correct data')
// // })
//
// test('terminate() should call worker.terminate()', (t) => {
//   // 创建一个模拟的 Worker
//   const worker = new Worker('')
//
//   // 创建 WorkerWrapper 实例
//   const workerWrapper = new WorkerWrapper(worker)
//
//   // 调用 terminate() 方法
//   workerWrapper.terminate()
//
//   // 验证 terminate() 方法被调用
//   // @ts-expect-error
//   t.true(worker.terminate.calledOnce)
// })
