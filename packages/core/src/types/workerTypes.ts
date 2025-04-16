import { Strategy } from './strategy'

export enum WorkerStatusEnum {
  RUNNING = 'running',
  WAITING = 'waiting',
}

export interface WorkerReq {
  chunk: ArrayBuffer
  strategy: Strategy
}

export interface WorkerRes<T> {
  result: T
  chunk: ArrayBuffer
}
