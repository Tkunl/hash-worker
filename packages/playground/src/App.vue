<script setup>
import { ref } from 'vue'
import { getFileHashInfo } from 'fast-upload'

const file = ref()

function handleInputChange(e) {
  file.value = e.target.files[0]
}

function handleGetHash() {
  getFileHashInfo(file.value).then((data) => {
    console.log('chunksHash', data.chunksHash)
    console.log('chunksHash', data.chunksHash)
  })
}

</script>

<template>
  <div>Hello</div>
  <input ref="inputRef" type="file" @change="handleInputChange"/>
  <button @click="handleGetHash">get Hash</button>
</template>

<style scoped>
</style>
