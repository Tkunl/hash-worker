export class MockWebWorker {
  onmessage?: (event: any) => void
  onerror?: (event: ErrorEvent) => void
  postMessage = jest.fn().mockImplementation(() => {
    this.onmessage && this.onmessage({ result: 'hash-string', chunk: new ArrayBuffer(1) })
  })
  terminate = jest.fn()
}
