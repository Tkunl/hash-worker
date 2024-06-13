<script lang="ts" setup>
import { ref } from 'vue'
import { getFileHashChunks, destroyWorkerPool, HashChksRes, HashChksParam } from 'hash-worker'

const file = ref<File>()

function handleInputChange(e: any) {
  file.value = e.target.files[0]
}

function handleGetHash() {
  const param: HashChksParam = {
    file: file.value,
    config: {
      maxWorkerCount: 2
    }
  }

  const beforeDate = Date.now()
  getFileHashChunks(param).then((data: HashChksRes) => {
    const afterDate = Date.now()
    console.log(data)
    console.log(afterDate - beforeDate)
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
