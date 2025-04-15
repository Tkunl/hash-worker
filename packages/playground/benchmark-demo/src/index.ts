import { benchmark, BenchmarkOptions } from 'hash-worker-benchmark'
import { Strategy } from 'hash-worker'

const options: BenchmarkOptions = {
  sizeInMB: 100,
  workerCountTobeTest: [4, 4, 4, 6, 6, 6, 8, 8, 8],
  strategy: Strategy.md5,
}

benchmark(options).then(() => {})
