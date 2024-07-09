interface restoreFnOption {
  bufs?: ArrayBuffer[]
  buf: ArrayBuffer
  index: number
}

export type getFn<T> = (param: T) => ArrayBuffer
export type restoreFn = (options: restoreFnOption) => void
