<script lang="ts" setup>
import { useFileHashInfo } from './hooks/useFileHashInfo'
import { benchmark, BenchmarkOptions } from 'hash-worker-benchmark'

const { handleInputChange, handleGetHash, handleDestroyWorkerPool } = useFileHashInfo()

function handleDoBenchmark() {
  const options: BenchmarkOptions = {}
  benchmark(options).then(() => {
  })
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
