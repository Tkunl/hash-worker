export type Resolve<T = any> = (value: T | PromiseLike<T>) => void
export type Reject = (reason?: any) => void
