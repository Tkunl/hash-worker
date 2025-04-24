import { WorkerReq } from '../types'

class ArrayBufferService {
  private arrayBuffers: ArrayBuffer[] = []
  private hashFn: any

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

  setHashFn(hashFn: any) {
    this.hashFn = hashFn
    hashFn('123').then((res: string) => console.log('hash 123', res))
    this.hashFn('123').then((res: string) => console.log('hash 123', res))
    console.log('setHashFn,,,', this.hashFn)
  }

  getHashFn() {
    console.log('getHashFn,,,', this.hashFn)
    return this.hashFn
  }
}

const instance = new ArrayBufferService()
export const initBufService = instance.init?.bind(instance)
export const obtainBuf = instance.obtainFn!.bind(instance)
export const restoreBuf = instance.restoreFn!.bind(instance)

// TODO 待修改方法名
export const setHashFn = instance.setHashFn.bind(instance)
export const getHashFn = instance.getHashFn.bind(instance)
