export interface WorkerRes<T = any> {
  result: T
  chunk: ArrayBuffer
}
