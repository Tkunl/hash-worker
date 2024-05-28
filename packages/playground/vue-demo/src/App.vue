<script lang="ts" setup>
import { ref } from 'vue'
import { getFileHashChunks, Strategy, destroyWorkerPool, FileHashChunksResult, FileHashChunksParam } from 'hash-worker'

const file = ref<File>()

function handleInputChange(e: any) {
  file.value = e.target.files[0]
}

function handleGetHash() {
  const param: FileHashChunksParam = {
    file: file.value!,
    strategy: Strategy.crc32,
    isCloseWorkerImmediately: false
  }

  getFileHashChunks(param).then((data: FileHashChunksResult) => {
    console.log('chunksHash', data.chunksHash)
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
