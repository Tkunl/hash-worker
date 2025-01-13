import { MiniSubject } from '../../src/utils'

test('MiniSubject initializes with a value and can get the value', () => {
  const initial = 10
  const subject = new MiniSubject(initial)
  expect(subject.value).toBe(initial) // 使用 expect().toBe() 来断言值
})

// 测试 MiniSubject 能够订阅并立即接收初始值
test('MiniSubject can subscribe and receive the initial value immediately', () => {
  const initial = 'test'
  const subject = new MiniSubject(initial)
  const mockCallback = jest.fn() // 使用 jest 的模拟函数

  subject.subscribe(mockCallback)
  expect(mockCallback).toHaveBeenCalledWith(initial) // 确认回调函数被立即以初始值调用
})

// 测试 MiniSubject 在调用 next 后能够更新所有订阅者
test('MiniSubject updates all subscribers on next', () => {
  const subject = new MiniSubject(0)
  // 创建一个 Jest 模拟函数, 能够记录它被调用的情况, 包括调用了多少次, 以及每次调用时传入的参数等信息
  const mockCallback1 = jest.fn()
  const mockCallback2 = jest.fn()

  subject.subscribe(mockCallback1)
  subject.next(42) // 更新值
  subject.subscribe(mockCallback2)

  expect(mockCallback1.mock.calls.length).toBe(2)
  expect(mockCallback1.mock.calls[0][0]).toBe(0)
  expect(mockCallback1.mock.calls[1][0]).toBe(42)

  expect(mockCallback2.mock.calls.length).toBe(1)
})

// 测试 MiniSubject 取消订阅后不会更新回调函数
test('MiniSubject does not update unsubscribed callbacks', () => {
  const subject = new MiniSubject('initial')
  const mockCallback = jest.fn()

  const id = subject.subscribe(mockCallback)
  subject.unsubscribe(id)
  subject.next('updated')

  // 回调函数只应被调用一次（订阅时）
  expect(mockCallback.mock.calls.length).toBe(1)
})
