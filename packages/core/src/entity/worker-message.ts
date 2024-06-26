import { WorkerLabelsEnum } from '../enum'

export interface WorkerRep<T = any> {
  data: WorkerMessage<T>
}

// TODO 此处可能存在业务代码中没添加泛型的地方
type PostDefined<T> = T extends undefined ? undefined : T
export class WorkerMessage<T> {
  label: WorkerLabelsEnum
  content: PostDefined<T>

  constructor(label: WorkerLabelsEnum, content?: T) {
    this.label = label
    this.content = content as PostDefined<T>
  }
}
