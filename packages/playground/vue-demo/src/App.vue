<script lang="ts" setup>
import { ref } from 'vue'
import { getFileHashChunks, Strategy, destroyWorkerPool, HashChksParamRes, HashChksParam } from 'hash-worker'

const file = ref<File>()

function handleInputChange(e: any) {
  file.value = e.target.files[0]
}

function handleGetHash() {
  const param: HashChksParam = {
    file: file.value!,
    strategy: Strategy.md5,
    isCloseWorkerImmediately: false
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

</script>

<template>
  <div>Hello</div>
  <input type="file" @change="handleInputChange"/>
  <button @click="handleGetHash">get Hash</button>
  <button @click="handleDestroyWorkerPool">destroy pool</button>
</template>

<style scoped>
</style>
