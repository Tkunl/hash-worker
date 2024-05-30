import test from 'ava'
import { WorkerLabelsEnum } from '../src/enum'
import { WorkerMessage } from '../src/entity/worker-message'

// 测试用例：检查 WorkerMessage 实例化
test('WorkerMessage initializes with correct label and content', (t) => {
  const label = WorkerLabelsEnum.INIT
  const content = { foo: 'bar' }

  const message = new WorkerMessage(label, content)

  // 验证 label 属性是否正确设置
  t.is(message.label, label, 'Label should be set to WorkerLabelsEnum.INIT')

  // 验证 content 属性是否正确设置
  t.deepEqual(message.content, content, 'Content should be deeply equal to the provided object')
})

// 测试用例：不传递 content 时，默认参数应该是 undefined
test('WorkerMessage initializes with undefined content when not provided', (t) => {
  const label = WorkerLabelsEnum.CHUNK

  // 不传递content参数
  const message = new WorkerMessage(label)

  // content 应该是 undefined
  t.is(message.content, undefined, 'Content should be undefined when not provided')
})
