import sinon from 'sinon'

export class MockWorker {
  postMessage = sinon.stub()
  terminate = sinon.stub()
}
