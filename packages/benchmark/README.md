## Introduce for benchmark

**Hash worker benchmark** 用于测试 Hash worker 在不同线程下的 hash 计算速度

同时支持浏览器环境和 Node.js 环境

## Usage

```ts
import { benchmark, BenchmarkOptions } from 'hash-worker-benchmark'

// options 是可选的
const options: BenchmarkOptions = {}
benchmark(options)
```

## Options

**BenchmarkOptions**

| filed               | type     | default                                 | description                |
| ------------------- | -------- | --------------------------------------- | -------------------------- |
| sizeInMB            | number   | 500                                     | 用于测试的文件大小 (MB)    |
| strategy            | Strategy | Strategy.md5                            | hash 计算策略              |
| workerCountTobeTest | number[] | [1, 1, 1, 4, 4, 4, 8, 8, 8, 12, 12, 12] | 1, 4, 8, 12 线程各测试三次 |

```ts
// strategy.ts
export enum Strategy {
  md5 = 'md5',
  crc32 = 'crc32',
  mixed = 'mixed',
}
```

