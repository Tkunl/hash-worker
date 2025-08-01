# Hash Worker [![npm package](https://img.shields.io/npm/v/hash-worker.svg)](https://www.npmjs.com/package/hash-worker) [![Bundle size](https://badgen.net/bundlephobia/minzip/hash-worker)](https://bundlephobia.com/result?p=hash-worker)  [![codecov](https://codecov.io/gh/Tkunl/hash-worker/graph/badge.svg?token=G7GYAPEPYS)](https://codecov.io/gh/Tkunl/hash-worker) ![GitHub License](https://img.shields.io/github/license/Tkunl/hash-worker)

<p align="center">
<img src="https://socialify.git.ci/Tkunl/hash-worker/image?font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto" width="640" height="320" />
</p>

## Introduce

[中文文档](./README-zh.md)

**Hash-worker** is a library for fast calculation of file chunk hashes.

It is based on `hash-wasm` and utilizes `WebWorkers` for parallel computation, which speeds up computation when
processing file blocks.

Hash-worker supports two hash computation algorithms: `md5`, `xxHash64`, `xxHash128`.

Both `browser` and `Node.js` are supported.

> [!WARNING]
> The merkleHash computed by the Hash-worker is the root hash of a MerkleTree constructed based on file block hashes. Note that this is not directly equivalent to a hash of the file itself.

## Install

```bash
$ pnpm install hash-worker
```

## Usage

> [!WARNING]
If you are using `Vite` as your build tool, you need to add the following configuration to your `Vite` config file to exclude hash-worker from Vite's pre-bundling process.

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // other configurations ...
  optimizeDeps: {
    exclude: ['hash-worker'] // new added..
  }
})
```

### Global

```html
<script src="./global.js"></script>
<script src="./worker/browser.worker.mjs"></script>
<script>
  HashWorker.getFileHashChunks()
</script>
```

The `global.js` and `browser.worker.mjs` are the build artifacts resulting from executing `build:core` in `package.json`.

The build artifacts are located in the `packages/core/dist` directory.

### ESM

> [!WARNING]
> Import from 'hash-worker' in the browser environment
>
> Import from 'hash-worker/node' in the browser environment

``` ts
import { getFileHashChunks, destroyWorkerPool, HashWorkerResult, HashWorkerOptions } from 'hash-worker'

function handleGetHash(file: File) {
  const param: HashWorkerOptions = {
    file: file,
    config: {
      workerCount: 8,
      strategy: Strategy.md5
    }
  }

  getFileHashChunks(param).then((data: HashWorkerResult) => {
    console.log('chunksHash', data.chunksHash)
  })
}

/**
 * Destroy Worker Thread
 */
function handleDestroyWorkerPool() {
  destroyWorkerPool()
}
```

## Options

**HashWorkerOptions**

HashWorkerOptions is used to configure the parameters needed to calculate the hash.

| filed    | type   | default | description                                                                          |
|----------|--------|---------|--------------------------------------------------------------------------------------|
| file     | File   | /       | Files that need to calculate the hash (required for browser environments)            |
| filePath | string | /       | Path to the file where the hash is to be calculated (required for Node environments) |
| config   | Config | Config  | Parameters for calculating the Hash                                                  |

**Config**

| filed                    | type     | default        | description                                                                       |
|--------------------------|----------|----------------|-----------------------------------------------------------------------------------|
| chunkSize                | number   | 10 (MB)        | Size of the file slice                                                            |
| workerCount              | number   | 8              | Number of workers turned on at the same time as the hash is calculated            |
| strategy                 | Strategy | Strategy.xxHash128 | Hash computation strategy                                                         |
| isCloseWorkerImmediately | boolean  | true           | Whether to destroy the worker thread immediately when the calculation is complete |
| isShowLog                | boolean  | false           | Whether to show log in console when he calculation is complete  |
| hashFn                   | HashFn   | async (hLeft, hRight?) => (hRight ? md5(hLeft + hRight) : hLeft)| The hash method for build MerkleTree |

```ts
// strategy.ts
enum Strategy {
  md5 = 'md5',
  xxHash64 = 'xxHash64',
  xxHash128 = 'xxHash128',
}

type HashFn = (hLeft: string, hRight?: string) => Promise<string>
```



**HashWorkerResult**

HashWorkerResult is the returned result after calculating the hash value.

| filed      | type         | description                                                             |
|------------|--------------|-------------------------------------------------------------------------|
| chunksBlob | Blob[]       | In a browser environment only, the Blob[] of the file slice is returned |
| chunksHash | string[]     | Hash[] for file slicing                                                 |
| merkleHash | string       | The merkleHash of the file                                              |
| metadata   | FileMetaInfo | The metadata of the file                                                |

**FileMetaInfo**

| filed        | type   | description                                     |
|--------------|--------|-------------------------------------------------|
| name         | string | The name of the file used to calculate the hash |
| size         | number | File size in KB                                 |
| lastModified | number | Timestamp of the last modification of the file  |
| type         | string | file extension                                  |

### [Benchmark (MD5)](./packages/benchmark/README.md)

| Worker Count | Speed     |
|--------------|-----------|
| 1            | 229 MB/s  |
| 4            | 632 MB/s  |
| 8            | 886 MB/s  |
| 12           | 1037 MB/s |

The above data is run on the `Chrome v131` and `AMD Ryzen9 5950X` CPU, by using md5 to calculate hash.

## LICENSE

[MIT](./LICENSE)

## Contributions

Contributions are welcome! If you find a bug or want to add a new feature, please open an issue or submit a pull
request.

## Author and contributors

<p align="center">
  <a href="https://github.com/Tkunl">
    <img src="https://avatars.githubusercontent.com/u/19854081?v=4" width="40" height="40" alt="Tkunl">
  </a>
  <a href="https://github.com/Eternal-could">
    <img src="https://avatars.githubusercontent.com/u/74654896?v=4" width="40" height="40" alt="Eternal-could">
  </a>
  <a href="https://github.com/nonzzz">
    <img src="https://avatars.githubusercontent.com/u/52351095?v=4&s=40" width="40" height="40" alt="Kanno">
  </a>
</p>
