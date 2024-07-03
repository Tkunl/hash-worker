import { MiniSubject } from '../../packages/shared/src'

export class MockMiniSubject<T> extends MiniSubject<T> {
  constructor(value: T) {
    super(value)
  }

  next(value: T) {
    this._value = value
    this.subscribers.forEach((cb) => cb(value))
  }
}
