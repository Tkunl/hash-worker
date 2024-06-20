import { WorkerMessage } from '../../src/entity'
import { WorkerLabelsEnum } from '../../src/enum'

export class MockWebWorker {
  onmessage?: (event: any) => void
  onerror?: (event: ErrorEvent) => void
  postMessage = jest.fn().mockImplementation(() => {
    this.onmessage &&
      this.onmessage(new WorkerMessage(WorkerLabelsEnum.DONE, { result: 'hash-string' }))
  })
  terminate = jest.fn()
}
