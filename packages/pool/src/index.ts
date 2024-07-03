import * as workerPool from './worker-pool'
import * as WorkerWrapper from './worker-wrapper'

export default {
  ...workerPool,
  ...WorkerWrapper,
}

export * from './worker-pool'
export * from './worker-wrapper'
