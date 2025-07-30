# Hash Worker [![npm package](https://img.shields.io/npm/v/hash-worker.svg)](https://www.npmjs.com/package/hash-worker) [![Bundle size](https://badgen.net/bundlephobia/minzip/hash-worker)](https://bundlephobia.com/result?p=hash-worker)  [![codecov](https://codecov.io/gh/Tkunl/hash-worker/graph/badge.svg?token=G7GYAPEPYS)](https://codecov.io/gh/Tkunl/hash-worker) ![GitHub License](https://img.shields.io/github/license/Tkunl/hash-worker)

<p align="center">
<img src="https://socialify.git.ci/Tkunl/hash-worker/image?font=Inter&language=1&name=1&owner=1&pattern=Plus&theme=Auto" width="640" height="320" />
</p>

## Introduce

[English Document](./README.md)

**Hash-worker** 是一个用于快速计算文件哈希值的库。

它基于 hash-wasm 且利用了 WebWorker 进行并行计算，从而加快了计算文件分片的计算速度。

Hash-worker 支持两种哈希计算算法：`md5` 和 `xxHash128`。

同时支持 `浏览器` 和 `Node.js` 环境。

> [!WARNING]
> Hash-worker 计算出的 MerkleHash 是基于文件块哈希值构建的 MerkleTree 的根哈希值。请注意，这并不直接等同于文件本身的哈希值。

## Install

```bash
$ pnpm install hash-worker
```

## Usage

> [!WARNING]
> 如果你在使用 `Vite` 作为构建工具, 需要在 `Vite` 的配置文件中, 添加如下配置, 用于将 hash-worker 排除 vite 的预构建行为

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

其中 `global.js` 和 `browser.worker.mjs` 是执行 `package.json` 中的 `build:core` 后的打包产物

打包产物位于 `packages/core/dist` 目录

### ESM

> [!WARNING]
> 在浏览器环境下从 'hash-worker' 中导入
>
> 在 Node 环境下从 'hash-worker/node' 中导入

``` ts
import { getFileHashChunks, destroyWorkerPool, HashWorkerResult, HashChksParam } from 'hash-worker'

function handleGetHash(file: File) {
  const param: HashChksParam = {
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

**HashChksParam**

HashChksParam 是用于配置计算哈希值所需的参数。

| filed    | type   | default | description                 |
|----------|--------|---------|-----------------------------|
| file     | File   | /       | 需要计算 Hash 的文件（浏览器环境下必填）     |
| filePath | string | /       | 需要计算 Hash 的文件路径 （Node环境下必填） |
| config   | Config | Config  | 计算 Hash 时的参数                |

**Config**

| filed                    | type     | default        | description               |
|--------------------------|----------|----------------|---------------------------|
| chunkSize                | number   | 10 (MB)        | 文件分片的大小                   |
| workerCount              | number   | 8              | 计算 Hash 时同时开启的 worker 数量  |
| strategy                 | Strategy | Strategy.xxHash128 | hash 计算策略                 |
| isCloseWorkerImmediately | boolean  | true           | 当计算完成时, 是否立即销毁 Worker 线程  |
| isShowLog                | boolean  | false           | 当计算完成时, 是否在控制台显示 log  |
| hashFn                   | HashFn   | async (hLeft, hRight?) => (hRight ? md5(hLeft + hRight) : hLeft)| 构建 MerkleTree 时的 hash 方法 |

```ts
enum Strategy {
  md5 = 'md5',
  xxHash128 = 'xxHash128',
}

type HashFn = (hLeft: string, hRight?: string) => Promise<string>
```



**HashWorkerResult**

HashWorkerResult 是计算哈希值之后的返回结果。

| filed      | type         | description              |
|------------|--------------|--------------------------|
| chunksBlob | Blob[]       | 仅在浏览器环境下，会返回文件分片的 Blob[] |
| chunksHash | string[]     | 文件分片的 Hash[]             |
| merkleHash | string       | 文件的 merkleHash           |
| metadata   | FileMetaInfo | 文件的 metadata             |

**FileMetaInfo**

| filed        | type   | description    |
|--------------|--------|----------------|
| name         | string | 用于计算 hash 的文件名 |
| size         | number | 文件大小，单位：KB     |
| lastModified | number | 文件最后一次修改的时间戳   |
| type         | string | 文件后缀名          |

### [Benchmark (MD5)](./packages/benchmark/README-zh.md)

| Worker Count | Speed     |
|--------------|-----------|
| 1            | 229 MB/s  |
| 4            | 632 MB/s  |
| 8            | 886 MB/s  |
| 12           | 1037 MB/s |

* 以上数据是运行在 `Chrome v131` 和 `AMD Ryzen9 5950X` CPU 下, 通过使用 md5 来计算 hash 得到的。

## LICENSE

[MIT](./LICENSE)

## Contributions

欢迎贡献代码！如果你发现了一个 bug 或者想添加一个新功能，请提交一个 issue 或 pull request。

## Author and contributors

<p align="center">
  <a href="https://github.com/Tkunl">
    <img src="https://avatars.githubusercontent.com/u/19854081?v=4" width="40" height="40" alt="Tkunl">
  </a>
  <a href="https://github.com/nonzzz">
    <img src="https://avatars.githubusercontent.com/u/52351095?v=4&s=40" width="40" height="40" alt="Kanno">
  </a>
  <a href="https://github.com/Eternal-could">
    <img src="https://avatars.githubusercontent.com/u/74654896?v=4" width="40" height="40" alt="Eternal-could">
  </a>
</p>






