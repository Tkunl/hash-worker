import { WorkerLabelsEnum } from '../enum/worker-labels.enum'

export interface WorkerRep<T = any> {
  data: WorkerMessage<T>
}

export class WorkerMessage<T = any> {
  label: WorkerLabelsEnum
  content?: T

  constructor(label: WorkerLabelsEnum, content?: T) {
    this.label = label
    this.content = content
  }
}

// TODO 待替换掉上面的 WorkerMessage
type PostDefined<T> = T extends undefined ? undefined : T
export class WorkerMessage2<T> {
  label: WorkerLabelsEnum
  content: PostDefined<T>

  constructor(label: WorkerLabelsEnum, content?: T) {
    this.label = label
    this.content = content as PostDefined<T>
  }
}
