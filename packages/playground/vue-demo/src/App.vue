<script lang="ts" setup>
import { ref } from 'vue'
import { getFileHashChunks, destroyWorkerPool, HashChksRes, HashChksParam } from 'hash-worker'
import { md5 } from 'hash-wasm'

const file = ref<File>()

function handleInputChange(e: any) {
  file.value = e.target.files[0]
}

function handleGetHash() {
  const param: HashChksParam = {
    file: file.value!,
    config: {
      workerCount: 12,
    },
  }

  let result: any
  const beforeDate = Date.now()
  getFileHashChunks(param).then((res: HashChksRes) => {
    const afterDate = Date.now()
    const overTime = afterDate - beforeDate
    console.log(overTime + 'ms')
    console.log(696 / (overTime / 1000) + 'MB/s')
    result = res
  })
}

/**
 * Destroy Worker Thread
 */
function handleDestroyWorkerPool() {
  destroyWorkerPool()
}

function fileToArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = function(event: any) {
      resolve(event.target.result)
    }

    reader.onerror = function(event) {
      reject(new Error('文件读取出错'))
    }

    reader.readAsArrayBuffer(file)
  })
}

async function handleGetHashByWasm() {
  const buf = await fileToArrayBuffer(file.value!)
  let result: any
  const beforeDate = Date.now()
  md5(new Uint8Array(buf)).then((res) => {
    const afterDate = Date.now()
    const overTime = afterDate - beforeDate
    console.log(overTime + 'ms')
    console.log(696 / (overTime / 1000) + 'MB/s')
    result = res
    console.log('result: ', result)
  })
}

</script>

<template>
  <div>Hello</div>
  <input type="file" @change="handleInputChange" />
  <button @click="handleGetHash">get Hash</button>
  <button @click="handleDestroyWorkerPool">destroy pool</button>
  <button @click="handleGetHashByWasm">get Hash by Hash-Wasm</button>
</template>

<style scoped>
</style>
