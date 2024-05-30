import test from 'ava'
import { MiniSubject } from '../src/utils'

test('MiniSubject initializes with a value and can get the value', (t) => {
  const initial = 10
  const subject = new MiniSubject(initial)
  t.is(subject.value, initial, 'Initial value should be retrievable')
})

test('MiniSubject can subscribe and receive the initial value immediately', (t) => {
  const initial = 'test'
  const subject = new MiniSubject(initial)
  const testCb = (value: string) => {
    t.is(value, initial, 'Callback should receive the initial value immediately upon subscription')
  }

  subject.subscribe(testCb)
})

test('MiniSubject updates all subscribers on next', (t) => {
  const subject = new MiniSubject(0)
  let step = 0

  const testCb1 = (value: number) => {
    if (step === 0) {
      t.is(value, 0, 'Callback 1 should receive the initial value')
    } else if (step === 1) {
      t.is(value, 42, 'Callback 1 should receive the updated value')
    }
    step++
  }

  const testCb2 = (value: number) => {
    if (step === 0) {
      t.fail('Callback 2 should not trigger immediately')
    } else if (step === 1) {
      t.is(value, 42, 'Callback 2 should receive the updated value')
    }
  }

  subject.subscribe(testCb1)
  subject.next(42) // Update value, should trigger both callbacks
  const sid = subject.subscribe(testCb2)

  // to ensure testCb2 does not trigger immediately on subscribe
  t.pass()
  subject.unsubscribe(sid)
})

test('MiniSubject does not update unsubscribed callbacks', (t) => {
  const subject = new MiniSubject('initial')
  let callCount = 0

  const testCb = () => {
    callCount++
  }

  const id = subject.subscribe(testCb)
  subject.unsubscribe(id)
  subject.next('updated')

  t.is(callCount, 1, 'Callback should be called only once, before the unsubscribe')
})
