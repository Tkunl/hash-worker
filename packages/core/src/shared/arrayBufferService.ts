import { WorkerReq } from '../types'

class ArrayBufferService {
  private arrayBuffers: ArrayBuffer[] = []

  init(buf: ArrayBuffer[]) {
    this.arrayBuffers = buf
  }

  obtainFn(param: WorkerReq): ArrayBuffer {
    return param.chunk
  }

  restoreFn(options: { buf: ArrayBuffer; index: number }): void {
    const { index, buf } = options
    this.arrayBuffers[index] = buf
  }
}

const instance = new ArrayBufferService()
export const initBufService = instance.init?.bind(instance)
export const obtainBuf = instance.obtainFn!.bind(instance)
export const restoreBuf = instance.restoreFn!.bind(instance)
