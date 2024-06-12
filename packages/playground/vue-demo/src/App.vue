<script lang="ts" setup>
import { ref } from 'vue'
import { getFileHashChunks, Strategy, destroyWorkerPool, HashChksParamRes, HashChksParam, testWorker } from 'hash-worker'

const file = ref<File>()

function handleInputChange(e: any) {
  file.value = e.target.files[0]
}

function handleGetHash() {
  const param: HashChksParam = {
    file: file.value
  }

  getFileHashChunks(param).then((data: HashChksParamRes) => {
    console.log(data)
  })
}

/**
 * Destroy Worker Thread
 */
function handleDestroyWorkerPool() {
  destroyWorkerPool()
}

function handleDoTest() {
  testWorker()
}

</script>

<template>
  <div>Hello</div>
  <input type="file" @change="handleInputChange"/>
  <button @click="handleGetHash">get Hash</button>
  <button @click="handleDestroyWorkerPool">destroy pool</button>
  <button @click="handleDoTest">do test</button>
</template>

<style scoped>
</style>
