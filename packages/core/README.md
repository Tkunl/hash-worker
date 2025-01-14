# Hash Worker [![npm package](https://img.shields.io/npm/v/hash-worker.svg)](https://www.npmjs.com/package/hash-worker) [![Bundle size](https://badgen.net/bundlephobia/minzip/hash-worker)](https://bundlephobia.com/result?p=hash-worker)  [![codecov](https://codecov.io/gh/Tkunl/hash-worker/graph/badge.svg?token=G7GYAPEPYS)](https://codecov.io/gh/Tkunl/hash-worker) ![GitHub License](https://img.shields.io/github/license/Tkunl/hash-worker)

<p align="center">
<img src="https://socialify.git.ci/Tkunl/hash-worker/image?font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto" width="640" height="320" />
</p>

## Introduce

[中文文档](./README-zh.md)

**Hash-worker** is a library for fast calculation of file chunk hashes.

It is based on `hash-wasm` and utilizes `WebWorkers` for parallel computation, which speeds up computation when
processing file blocks.

Hash-worker supports two hash computation algorithms: `MD5` and `CRC32`.

Both `browser` and `Node.js` are supported.

> [!WARNING]
> The merkleHash computed by the Hash-worker is the root hash of a MerkleTree constructed based on file block hashes. Note that this is not directly equivalent to a hash of the file itself.

## Install

```bash
$ pnpm install hash-worker
```

## Usage

### Global

```html

<script src="./global.js"></script>
<script src="./worker/hash.worker.mjs"></script>
<script>
  HashWorker.getFileHashChunks()
</script>
```

The `global.js` and `hash.worker.mjs` are the build artifacts resulting from executing `build:core` in `package.json`.

The build artifacts are located in the `packages/core/dist` directory.

### ESM

``` ts
import { getFileHashChunks, destroyWorkerPool, HashChksRes, HashChksParam } from 'hash-worker'

function handleGetHash(file: File) {
  const param: HashChksParam = {
    file: file,
    config: {
      workerCount: 8,
      strategy: Strategy.md5
    }
  }

  getFileHashChunks(param).then((data: HashChksRes) => {
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

> [!WARNING]
If you are using `Vite` as your build tool, you need to add some configurations in your `vite.config.js` to exclude hash-worker from optimizeDeps.

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

> [!WARNING]
>
> If you are using `Webpack` as your build tool, you need add some configs in your `webpack.config.js` for exclude the parsing of node related modules.

```js
// webpack.config.js
module.exports = {
  // new added..
  resolve: { 
    fallback: {
      fs: false,
      path: false,
      'fs/promises': false,
      worker_threads: false,
    },
  },
  // new added..
  externals: {
    fs: 'commonjs fs',
    path: 'commonjs path',
    'fs/promises': 'commonjs fs/promises',
    worker_threads: 'commonjs worker_threads',
  },
}
```

## Options

**HashChksParam**

HashChksParam is used to configure the parameters needed to calculate the hash.

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
| strategy                 | Strategy | Strategy.mixed | Hash computation strategy                                                         |
| borderCount              | number   | 100            | The cutoff for the hash calculation rule in 'mixed' mode                          |
| isCloseWorkerImmediately | boolean  | true           | Whether to destroy the worker thread immediately when the calculation is complete |

```ts
// strategy.ts
export enum Strategy {
  md5 = 'md5',
  crc32 = 'crc32',
  xxHash64 = 'xxHash64',
  mixed = 'mixed',
}
```

When Strategy.mixed strategy is used, if the number of file fragments is less than borderCount, the md5 algorithm will
be used to calculate the hash value to build the MerkleTree.
Otherwise, it switches to using the crc32 algorithm for MerkleTree construction.

**HashChksRes**

HashChksRes is the returned result after calculating the hash value.

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
| 1            | 234 MB/s  |
| 4            | 610 MB/s  |
| 8            | 851 MB/s  |
| 12           | 1011 MB/s |

* These measurements were made with `Chrome v126` on `AMD Ryzen9 5950X` CPU

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
