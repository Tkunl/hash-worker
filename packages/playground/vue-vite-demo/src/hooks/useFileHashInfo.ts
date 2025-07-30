import { ref } from 'vue'
import {
  destroyWorkerPool,
  getFileHashChunks,
  HashWorkerOptions,
  HashWorkerResult,
  Strategy,
} from 'hash-worker'

export function useFileHashInfo() {
  const file = ref<File>()

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    if (target.files) {
      file.value = target.files[0]
    }
  }

  function handleGetHash() {
    const param: HashWorkerOptions = {
      file: file.value!,
      config: {
        workerCount: 1,
        strategy: Strategy.xxHash128,
        isShowLog: true,
        // hashFn: async (hLeft, hRight?) => (hRight ? md5(hLeft + hRight) : hLeft)
      },
    }

    getFileHashChunks(param).then((res: HashWorkerResult) => {
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
