## Introduce for benchmark

This project is used to test the hash calculation speed of Hash worker in different threads.

It supports both `browser` and `Node.js` environments.

### Usage

```ts
import { benchmark, BenchmarkOptions } from 'hash-worker-benchmark'

// options is optional.
const options: BenchmarkOptions = {}
benchmark(options)
```

### Options

**BenchmarkOptions**

| filed               | type     | default                                 | description                |
| ------------------- | -------- | --------------------------------------- | -------------------------- |
| sizeInMB            | number   | 500                                     | File size for testing (MB)    |
| strategy            | Strategy | Strategy.md5                            | Hash computation strategy     |
| workerCountTobeTest | number[] | [1, 1, 1, 4, 4, 4, 8, 8, 8, 12, 12, 12] | Hashing performance was measured 3 times in each of the 1/4/8/12 threads |

```ts
// strategy.ts
export enum Strategy {
  md5 = 'md5',
  crc32 = 'crc32',
  mixed = 'mixed',
}
```
### LICENSE

[MIT](./../../LICENSE)
