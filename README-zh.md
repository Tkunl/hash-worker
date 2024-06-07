## Introduce

[English Document](./README.md)

**Hash-worker** 是一个用于快速计算文件哈希值的库。
它基于 hash-wasm 且利用 WebWorkers 进行并行计算，从而加快了处理文件块时的计算速度。
Hash-worker 支持两种哈希计算算法：MD5 和 CRC32。

> [!WARNING]
> Hash-worker 计算出的 merkleHash 是基于文件块哈希值构建的 MerkleTree 的根哈希值。请注意，这并不直接等同于文件本身的哈希值。

## Install

```bash
$ yarn add hash-worker
# or
$ npm install hash-worker
```

## Usage

``` ts
import { getFileHashChunks, Strategy, destroyWorkerPool, FileHashChunksResult, FileHashChunksParam } from 'Hash-worker'

function handleGetHash() {
  const param: FileHashChunksParam = {
    file: file!,
    strategy: Strategy.crc32
  }

  getFileHashChunks(param).then((data: FileHashChunksResult) => {
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

FileHashChunksParam

| params                   | type     | default        | description                            |
| ------------------------ | -------- | -------------- | -------------------------------------- |
| file                     | File     | /              | 需要计算 Hash 的文件 (必填)            |
| chunkSize                | number   | 10 (MB)        | 分块大小                               |
| maxWorkerCount           | number   | 8              | 计算 Hash 时同时开启 worker 的数量     |
| strategy                 | Strategy | Strategy.mixed | hash 计算策略                          |
| borderCount              | number   | 100            | 'mixed' 模式下 hash 计算规则的分界点   |
| isCloseWorkerImmediately | boolean  | true           | 当计算完成时, 是否立即销毁 Worker 线程 |

```ts
// strategy.ts
export enum Strategy {
  md5 = 'md5',
  crc32 = 'crc32',
  mixed = 'mixed',
}
```

当采用 Strategy.mixed 策略时，若文件碎片数量少于 borderCount，将采用md5算法计算哈希值来构建 MerkleTree。
否则，则切换至使用crc32算法进行MerkleTree的构建。

### LICENSE

[MIT](./LICENSE)

### Contributions

Contributions are welcome! If you find a bug or want to add a new feature, please open an issue or submit a pull request.

### Author and contributors

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







