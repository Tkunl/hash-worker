import { StatusEnum, WorkerWrapper } from '../../src/entity'

export class MockWorkerWrapper extends WorkerWrapper {
  constructor() {
    super({
      terminate: () => {},
    } as Worker)
    this.status = StatusEnum.WAITING
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run<T>(param: ArrayBuffer, params: ArrayBuffer[], index: number) {
    return Promise.resolve('result' as unknown as T)
  }
}
