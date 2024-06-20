import sinon from 'sinon'
import { WorkerPoolForMd5 } from '../../src/worker/worker-pool-for-md5'

export class MockWorkerPoolForMd5s extends WorkerPoolForMd5 {
  exec = sinon.stub().resolves(['md5-result'])
}
