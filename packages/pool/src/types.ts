export type AngFn = (...args: any[]) => any

export interface WorkerRes<T = any> {
  result: T
  chunk: ArrayBuffer
}

export interface WorkerReq<T = any> {
  fn: AngFn
  fnArgs: T[]
  transferList?: ArrayBuffer[]
  transferBackFn?: (transferable: ArrayBuffer, transferList: ArrayBuffer[], index: number) => void
}
