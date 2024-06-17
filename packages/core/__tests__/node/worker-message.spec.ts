import { WorkerLabelsEnum } from '../../src/enum'
import { WorkerMessage } from '../../src/entity'

describe('WorkerMessage Tests', () => {
  // 测试 WorkerMessage 使用正确的 label 和 content 初始化
  test('WorkerMessage initializes with correct label and content', () => {
    const label = WorkerLabelsEnum.INIT
    const content = { foo: 'bar' }

    const message = new WorkerMessage(label, content)

    // 验证 label 属性是否正确设置
    expect(message.label).toBe(label)

    // 验证 content 属性是否正确设置
    expect(message.content).toEqual(content)
  })

  // 测试用例：不传递 content 时，默认参数应该是 undefined
  test('WorkerMessage initializes with undefined content when not provided', () => {
    const label = WorkerLabelsEnum.CHUNK

    // 不传递content参数
    const message = new WorkerMessage(label)

    // content 应该是 undefined
    expect(message.content).toBeUndefined()
  })
})
