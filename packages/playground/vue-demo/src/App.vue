<script lang="ts" setup>
import { ref } from 'vue'
import { getFileHashChunks, Strategy, FileHashChunksResult, FileHashChunksParam } from 'kun-hash'

const file = ref<File>()

function handleInputChange(e: any) {
  file.value = e.target.files[0]
}

function handleGetHash() {
  const param: FileHashChunksParam = {
    file: file.value!,
    strategy: Strategy.crc32
  }

  getFileHashChunks(param).then((data: FileHashChunksResult) => {
    console.log('chunksHash', data.chunksHash)
  })
}

</script>

<template>
  <div>Hello</div>
  <input type="file" @change="handleInputChange"/>
  <button @click="handleGetHash">get Hash</button>
</template>

<style scoped>
</style>
