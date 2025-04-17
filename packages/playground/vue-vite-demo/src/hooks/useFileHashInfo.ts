import { ref } from 'vue'
import {
  destroyWorkerPool,
  getFileHashChunks,
  HashChksParam,
  HashChksRes,
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
    const param: HashChksParam = {
      file: file.value!,
      config: {
        workerCount: 6,
        strategy: Strategy.md5,
        isShowLog: true,
        isCloseWorkerImmediately: false,
      },
    }

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
