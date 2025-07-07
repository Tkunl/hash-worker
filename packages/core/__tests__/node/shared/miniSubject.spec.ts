import { MiniSubject } from '../../../src/shared/miniSubject'

describe('MiniSubject', () => {
  describe('构造函数', () => {
    it('应该正确初始化初始值', () => {
      const subject = new MiniSubject(42)
      expect(subject.value).toBe(42)
    })

    it('应该处理字符串类型的初始值', () => {
      const subject = new MiniSubject('hello')
      expect(subject.value).toBe('hello')
    })

    it('应该处理对象类型的初始值', () => {
      const initialValue = { id: 1, name: 'test' }
      const subject = new MiniSubject(initialValue)
      expect(subject.value).toEqual(initialValue)
    })

    it('应该处理数组类型的初始值', () => {
      const initialValue = [1, 2, 3]
      const subject = new MiniSubject(initialValue)
      expect(subject.value).toEqual(initialValue)
    })
  })

  describe('value getter', () => {
    it('应该返回当前值', () => {
      const subject = new MiniSubject(100)
      expect(subject.value).toBe(100)
    })

    it('应该返回更新后的值', () => {
      const subject = new MiniSubject(100)
      subject.next(200)
      expect(subject.value).toBe(200)
    })
  })

  describe('next', () => {
    it('应该更新当前值', () => {
      const subject = new MiniSubject(100)
      subject.next(200)
      expect(subject.value).toBe(200)
    })

    it('应该通知所有订阅者', () => {
      const subject = new MiniSubject(100)
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()

      subject.subscribe(mockCallback1)
      subject.subscribe(mockCallback2)

      subject.next(200)

      expect(mockCallback1).toHaveBeenCalledWith(200)
      expect(mockCallback2).toHaveBeenCalledWith(200)
    })

    it('应该多次通知订阅者', () => {
      const subject = new MiniSubject(100)
      const mockCallback = jest.fn()

      subject.subscribe(mockCallback)

      subject.next(200)
      subject.next(300)
      subject.next(400)

      expect(mockCallback).toHaveBeenCalledTimes(4) // 初始订阅 + 3次更新
      expect(mockCallback).toHaveBeenNthCalledWith(1, 100) // 初始值
      expect(mockCallback).toHaveBeenNthCalledWith(2, 200)
      expect(mockCallback).toHaveBeenNthCalledWith(3, 300)
      expect(mockCallback).toHaveBeenNthCalledWith(4, 400)
    })

    it('应该处理对象类型的值更新', () => {
      const subject = new MiniSubject({ id: 1, name: 'old' })
      const mockCallback = jest.fn()

      subject.subscribe(mockCallback)

      const newValue = { id: 2, name: 'new' }
      subject.next(newValue)

      expect(subject.value).toEqual(newValue)
      expect(mockCallback).toHaveBeenCalledWith(newValue)
    })

    it('当没有订阅者时应该正常工作', () => {
      const subject = new MiniSubject(100)
      expect(() => subject.next(200)).not.toThrow()
      expect(subject.value).toBe(200)
    })
  })

  describe('subscribe', () => {
    it('应该返回订阅ID', () => {
      const subject = new MiniSubject(100)
      const mockCallback = jest.fn()

      const id = subject.subscribe(mockCallback)

      expect(typeof id).toBe('string')
      expect(id.length).toBe(32) // generateUUID 生成32位字符串
    })

    it('应该立即调用订阅者回调函数', () => {
      const subject = new MiniSubject(100)
      const mockCallback = jest.fn()

      subject.subscribe(mockCallback)

      expect(mockCallback).toHaveBeenCalledWith(100)
    })

    it('应该支持多个订阅者', () => {
      const subject = new MiniSubject(100)
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      const mockCallback3 = jest.fn()

      const id1 = subject.subscribe(mockCallback1)
      const id2 = subject.subscribe(mockCallback2)
      const id3 = subject.subscribe(mockCallback3)

      expect(id1).not.toBe(id2)
      expect(id1).not.toBe(id3)
      expect(id2).not.toBe(id3)

      expect(mockCallback1).toHaveBeenCalledWith(100)
      expect(mockCallback2).toHaveBeenCalledWith(100)
      expect(mockCallback3).toHaveBeenCalledWith(100)
    })

    it('订阅者应该收到后续的值更新', () => {
      const subject = new MiniSubject(100)
      const mockCallback = jest.fn()

      subject.subscribe(mockCallback)

      subject.next(200)
      subject.next(300)

      expect(mockCallback).toHaveBeenCalledTimes(3)
      expect(mockCallback).toHaveBeenNthCalledWith(1, 100)
      expect(mockCallback).toHaveBeenNthCalledWith(2, 200)
      expect(mockCallback).toHaveBeenNthCalledWith(3, 300)
    })
  })

  describe('unsubscribe', () => {
    it('应该移除指定的订阅者', () => {
      const subject = new MiniSubject(100)
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()

      const id1 = subject.subscribe(mockCallback1)
      subject.subscribe(mockCallback2)

      subject.unsubscribe(id1)

      subject.next(200)

      expect(mockCallback1).toHaveBeenCalledTimes(1) // 只有初始订阅
      expect(mockCallback2).toHaveBeenCalledTimes(2) // 初始订阅 + 更新
    })

    it('应该处理不存在的订阅ID', () => {
      const subject = new MiniSubject(100)
      const mockCallback = jest.fn()

      subject.subscribe(mockCallback)

      expect(() => subject.unsubscribe('non-existent-id')).not.toThrow()
    })

    it('应该支持多次取消订阅', () => {
      const subject = new MiniSubject(100)
      const mockCallback = jest.fn()

      const id = subject.subscribe(mockCallback)

      subject.unsubscribe(id)
      subject.unsubscribe(id) // 再次取消订阅

      subject.next(200)

      expect(mockCallback).toHaveBeenCalledTimes(1) // 只有初始订阅
    })

    it('应该正确处理所有订阅者被取消订阅的情况', () => {
      const subject = new MiniSubject(100)
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()

      const id1 = subject.subscribe(mockCallback1)
      const id2 = subject.subscribe(mockCallback2)

      subject.unsubscribe(id1)
      subject.unsubscribe(id2)

      expect(() => subject.next(200)).not.toThrow()
      expect(subject.value).toBe(200)
      // 验证两个回调都没有被调用（除了初始订阅）
      expect(mockCallback1).toHaveBeenCalledTimes(1)
      expect(mockCallback2).toHaveBeenCalledTimes(1)
    })
  })

  describe('集成测试', () => {
    it('应该正确处理完整的订阅生命周期', () => {
      const subject = new MiniSubject(0)
      const receivedValues: number[] = []

      const callback = (value: number) => {
        receivedValues.push(value)
      }

      // 订阅
      const id = subject.subscribe(callback)

      // 更新值
      subject.next(1)
      subject.next(2)
      subject.next(3)

      // 取消订阅
      subject.unsubscribe(id)

      // 再次更新值
      subject.next(4)

      expect(receivedValues).toEqual([0, 1, 2, 3])
      expect(subject.value).toBe(4)
    })

    it('应该支持多个订阅者的复杂场景', () => {
      const subject = new MiniSubject('initial')
      const results1: string[] = []
      const results2: string[] = []

      const callback1 = (value: string) => results1.push(value)
      const callback2 = (value: string) => results2.push(value)

      const id1 = subject.subscribe(callback1)
      subject.next('first')

      const id2 = subject.subscribe(callback2)
      subject.next('second')

      subject.unsubscribe(id1)
      subject.next('third')

      subject.unsubscribe(id2)
      subject.next('fourth')

      expect(results1).toEqual(['initial', 'first', 'second'])
      expect(results2).toEqual(['first', 'second', 'third'])
      expect(subject.value).toBe('fourth')
    })
  })
})
