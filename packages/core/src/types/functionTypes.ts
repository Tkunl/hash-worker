export type GetFn<T> = (param: T) => ArrayBuffer
export type RestoreFn = (options: { bufs?: ArrayBuffer[]; buf: ArrayBuffer; index: number }) => void

export type Resolve<T = any> = (value: T | PromiseLike<T>) => void
export type Reject = (reason?: any) => void
