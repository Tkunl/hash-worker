import { generateUUID } from './rand'

type Cb<T> = (value: T) => void

export class MiniSubject<T> {
  protected _value: T
  protected subscribers: Map<string, Cb<T>> = new Map()

  constructor(value: T) {
    this._value = value
  }

  get value() {
    return this._value
  }

  next(value: T) {
    this._value = value
    this.subscribers.forEach((cb) => cb(value))
  }

  subscribe(cb: Cb<T>) {
    const id = generateUUID()
    this.subscribers.set(id, cb)
    cb(this.value)
    return id
  }

  unsubscribe(id: string) {
    this.subscribers.delete(id)
  }
}
