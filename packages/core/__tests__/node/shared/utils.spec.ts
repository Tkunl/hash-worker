import { getArrParts, runAsyncFuncSerialized, generateUUID } from '../../../src/shared/utils'

describe('utils', () => {
  describe('getArrParts', () => {
    it('应该正确分割数组', () => {
      const arr = [1, 2, 3, 4, 5, 6]
      expect(getArrParts(arr, 2)).toEqual([
        [1, 2],
        [3, 4],
        [5, 6],
      ])
      expect(getArrParts(arr, 3)).toEqual([
        [1, 2, 3],
        [4, 5, 6],
      ])
      expect(getArrParts(arr, 4)).toEqual([
        [1, 2, 3, 4],
        [5, 6],
      ])
    })

    it('当 size 等于数组长度时，应该返回原数组', () => {
      const arr = [1, 2, 3]
      expect(getArrParts(arr, 3)).toEqual([[1, 2, 3]])
    })

    it('当 size 大于数组长度时，应该返回原数组', () => {
      const arr = [1, 2, 3]
      expect(getArrParts(arr, 5)).toEqual([[1, 2, 3]])
    })

    it('当 size 为 1 时，应该将每个元素分割成单独的数组', () => {
      const arr = [1, 2, 3]
      expect(getArrParts(arr, 1)).toEqual([[1], [2], [3]])
    })

    it('当 size 为 0 或负数时，应该抛出 RangeError', () => {
      const arr = [1, 2, 3]
      expect(() => getArrParts(arr, 0)).toThrow(RangeError)
      expect(() => getArrParts(arr, 0)).toThrow('size must be a positive integer')
      expect(() => getArrParts(arr, -1)).toThrow(RangeError)
      expect(() => getArrParts(arr, -1)).toThrow('size must be a positive integer')
      expect(() => getArrParts(arr, -5)).toThrow(RangeError)
      expect(() => getArrParts(arr, -5)).toThrow('size must be a positive integer')
    })

    it('当 size 不是整数时，应该抛出 RangeError', () => {
      const arr = [1, 2, 3]
      expect(() => getArrParts(arr, 1.5)).toThrow(RangeError)
      expect(() => getArrParts(arr, 1.5)).toThrow('size must be a positive integer')
      expect(() => getArrParts(arr, 2.7)).toThrow(RangeError)
      expect(() => getArrParts(arr, 2.7)).toThrow('size must be a positive integer')
    })

    it('当输入空数组时，应该返回空数组', () => {
      expect(getArrParts([], 2)).toEqual([])
    })

    it('应该处理字符串数组', () => {
      const arr = ['a', 'b', 'c', 'd']
      expect(getArrParts(arr, 2)).toEqual([
        ['a', 'b'],
        ['c', 'd'],
      ])
    })

    it('应该处理对象数组', () => {
      const arr = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
      expect(getArrParts(arr, 2)).toEqual([
        [{ id: 1 }, { id: 2 }],
        [{ id: 3 }, { id: 4 }],
      ])
    })
  })

  describe('runAsyncFuncSerialized', () => {
    it('应该按顺序串行执行异步函数并合并结果', async () => {
      const tasks = [
        () => Promise.resolve([1, 2]),
        () => Promise.resolve([3, 4]),
        () => Promise.resolve([5, 6]),
      ]

      const result = await runAsyncFuncSerialized(tasks)
      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('应该处理返回空数组的异步函数', async () => {
      const tasks = [
        () => Promise.resolve([1, 2]),
        () => Promise.resolve([]),
        () => Promise.resolve([3, 4]),
      ]

      const result = await runAsyncFuncSerialized(tasks)
      expect(result).toEqual([1, 2, 3, 4])
    })

    it('当任务数组为空时，应该返回空数组', async () => {
      const result = await runAsyncFuncSerialized([])
      expect(result).toEqual([])
    })

    it('应该处理异步函数抛出错误的情况', async () => {
      const tasks = [
        () => Promise.resolve([1, 2]),
        () => Promise.reject(new Error('测试错误')),
        () => Promise.resolve([3, 4]),
      ]

      await expect(runAsyncFuncSerialized(tasks)).rejects.toThrow('测试错误')
    })

    it('应该处理包含复杂对象的数组', async () => {
      const tasks = [
        () => Promise.resolve([{ id: 1, name: 'Alice' }]),
        () =>
          Promise.resolve([
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' },
          ]),
      ]

      const result = await runAsyncFuncSerialized(tasks)
      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ])
    })

    it('应该确保函数按顺序执行', async () => {
      const executionOrder: number[] = []

      const tasks = [
        async () => {
          executionOrder.push(1)
          await new Promise((resolve) => setTimeout(resolve, 10))
          return [1]
        },
        async () => {
          executionOrder.push(2)
          await new Promise((resolve) => setTimeout(resolve, 5))
          return [2]
        },
        async () => {
          executionOrder.push(3)
          return [3]
        },
      ]

      const result = await runAsyncFuncSerialized(tasks)
      expect(result).toEqual([1, 2, 3])
      expect(executionOrder).toEqual([1, 2, 3])
    })
  })

  describe('generateUUID', () => {
    it('应该生成有效的 UUID v4 格式字符串', () => {
      const uuid = generateUUID()
      // UUID v4 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('应该生成不同的 UUID', () => {
      const uuid1 = generateUUID()
      const uuid2 = generateUUID()
      const uuid3 = generateUUID()

      expect(uuid1).not.toBe(uuid2)
      expect(uuid1).not.toBe(uuid3)
      expect(uuid2).not.toBe(uuid3)
    })

    it('应该生成正确长度的字符串', () => {
      const uuid = generateUUID()
      expect(uuid).toHaveLength(36) // UUID v4 标准长度包含连字符
    })

    it('应该只包含十六进制字符和连字符', () => {
      const uuid = generateUUID()
      expect(uuid).toMatch(/^[0-9a-f-]+$/)
    })

    it('应该符合 UUID v4 格式', () => {
      const uuid = generateUUID()
      // 检查第13位是否为4 (根据 UUID v4 标准)
      expect(uuid[14]).toBe('4') // 第14位是版本号位置（0-based index）
      // 检查第17位是否为8, 9, a, 或 b (根据 UUID v4 标准)
      expect(['8', '9', 'a', 'b']).toContain(uuid[19]) // 第19位是变体位置（0-based index）
    })
  })
})
