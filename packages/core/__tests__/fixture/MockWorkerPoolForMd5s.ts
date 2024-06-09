import sinon from 'sinon'
import { WorkerPoolForMd5s } from '../../src/worker/worker-pool-for-md5s'

export class MockWorkerPoolForMd5s extends WorkerPoolForMd5s {
  exec = sinon.stub().resolves(['md5-result'])
}
