import { WorkerLabelsEnum } from '../enum'

export interface WorkerRep<T = any> {
  data: WorkerMessage<T>
}

type PostDefined<T> = T extends undefined ? undefined : T
export class WorkerMessage<T> {
  label: WorkerLabelsEnum
  content: PostDefined<T>

  constructor(label: WorkerLabelsEnum, content?: T) {
    console.log('WorkerMessage created ...')
    this.label = label
    this.content = content as PostDefined<T>
  }
}
