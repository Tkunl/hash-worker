import { benchmark, BenchmarkOptions } from 'hash-worker-benchmark'

const options: BenchmarkOptions = {
  sizeInMB: 110,
  workerCountTobeTest: [ 8 ],
}

// const toMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(2)
// const beforeMemoryUsage = process.memoryUsage()
// console.log('beforeMemoryUsage', toMB(beforeMemoryUsage.rss))
benchmark(options).then(() => {
  // const afterMemoryUsage = process.memoryUsage()
  // console.log('afterMemoryUsage', toMB(afterMemoryUsage.rss))
})
