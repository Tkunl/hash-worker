import { benchmark, BenchmarkOptions } from 'hash-worker-benchmark'
import { Strategy } from 'hash-worker'

const options: BenchmarkOptions = {
  sizeInMB: 100,
  workerCountTobeTest: [ 8, 8, 8 ],
  strategy: Strategy.crc32
}

// const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2)
// const beforeMemoryUsage = process.memoryUsage()
// console.log('beforeMemoryUsage', toMB(beforeMemoryUsage.rss))
benchmark(options).then(() => {
  // const afterMemoryUsage = process.memoryUsage()
  // console.log('afterMemoryUsage', toMB(afterMemoryUsage.rss))
})
