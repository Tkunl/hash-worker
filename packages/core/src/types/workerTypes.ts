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

// 新增：任务结果类型，确保类型安全
export type TaskResult<T> =
  | { success: true; data: T; index: number }
  | { success: false; error: Error; index: number }

// 新增：任务配置接口
export interface TaskConfig {
  timeout?: number
  retries?: number
}
