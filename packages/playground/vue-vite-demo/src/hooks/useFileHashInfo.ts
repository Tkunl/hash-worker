import { ref } from 'vue'
import {
  destroyWorkerPool,
  getFileHashChunks,
  HashChksParam,
  HashChksRes,
  Strategy,
} from 'hash-worker'
import { md5 } from 'hash-wasm'

export function useFileHashInfo() {
  const file = ref<File>()

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.files) {
      file.value = target.files[0]
    }
  }

  function handleGetHash() {
    console.log('handleGetHash', md5)
    const param: HashChksParam = {
      file: file.value!,
      config: {
        workerCount: 6,
        strategy: Strategy.md5,
        isShowLog: true,
        // hashFn: async (hLeft, hRight?) => (hRight ? md5(hLeft + hRight) : hLeft)
        hashFn2: md5,
      },
    }

    md5('123').then((res: string) => console.log('hash 123', res))

    getFileHashChunks(param).then((res: HashChksRes) => {
      console.log(res)
      alert('Calculation complete, please check the console!')
    })
  }

  function handleDestroyWorkerPool() {
    destroyWorkerPool()
  }

  return {
    handleInputChange,
    handleGetHash,
    handleDestroyWorkerPool,
  }
}
