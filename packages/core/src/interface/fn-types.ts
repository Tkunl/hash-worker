export type getFn<T> = (param: T) => ArrayBuffer
export type restoreFn<T> = (params: T[], param: ArrayBuffer, index: number) => void
