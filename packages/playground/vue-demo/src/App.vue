<script lang="ts" setup>
import { useFileHashInfo } from './hooks/useFileHashInfo'
import { useBenchmark } from './hooks/useBenchmark'
import { Strategy } from 'hash-worker'

const { handleInputChange, handleGetHash, handleDestroyWorkerPool } = useFileHashInfo()

function handleDoBenchmark() {
  useBenchmark('data.txt', 500, Strategy.md5)
}

</script>

<template>
  <div>Hello</div>
  <input type="file" @change="handleInputChange" />

  <div>
    <button @click="handleGetHash">get Hash</button>
    <button @click="handleDestroyWorkerPool">destroy pool</button>
    <button @click="handleDoBenchmark">Benchmark</button>
  </div>
</template>
