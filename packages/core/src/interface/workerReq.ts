import { Strategy } from './strategy'

export interface WorkerReq {
  chunk: ArrayBuffer
  strategy: Strategy
}
