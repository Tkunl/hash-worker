import { Strategy } from './strategy'

export enum WorkerStatusEnum {
  RUNNING = 'running',
  WAITING = 'waiting',
  ERROR = 'error',
}

export interface WorkerReq {
  chunk: ArrayBuffer
  strategy: Strategy
}

export interface WorkerRes<T> {
  result: T
  chunk: ArrayBuffer
}

export type TaskResult<T> =
  | { success: true; data: T; index: number }
  | { success: false; error: Error; index: number }

export interface TaskConfig {
  timeout?: number
  // 重试次数预留, 目前未实现
  retries?: number
}
