import * as workerPool from './worker-pool'
import * as WorkerWrapper from './worker-wrapper'

import * as workerPool2 from './worker-pool2'
import * as WorkerWrapper2 from './worker-wrapper2'

export default {
  ...workerPool,
  ...WorkerWrapper,
  ...workerPool2,
  ...WorkerWrapper2,
}

export * from './worker-pool'
export * from './worker-wrapper'

export * from './worker-pool2'
export * from './worker-wrapper2'
