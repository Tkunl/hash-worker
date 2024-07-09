import { StatusEnum, WorkerWrapper } from '../../src/entity'

export class MockWorkerWrapper extends WorkerWrapper {
  constructor() {
    super({
      terminate: () => {},
    } as Worker)
    this.status = StatusEnum.WAITING
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run<T, U>(param: U, index: number, getFn: any, restoreFn: any) {
    return Promise.resolve('result' as unknown as T)
  }
}
