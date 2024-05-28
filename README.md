## Introduce
Hash-worker is a library for quickly calculating file hashes. It leverages WebWorkers for parallel computation based on hash-wasm, accelerating the speed of calculation when processing file chunks. Hash-worker supports two algorithms for hash calculation: md5 and crc32.

> [!WARNING]
> The merkleHash calculated using Hash-worker is derived from computing the MerkleTree based on the hashes of file chunks, resulting in the rootHash, rather than the hash of the file itself.

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

| params                   | type     | default        | description                                                  |
| ------------------------ | -------- | -------------- | ------------------------------------------------------------ |
| file                     | File     | /              | The file for which the Hash is to be calculated (required)   |
| chunkSize                | number   | 10 (MB)        | Chunk size                                                   |
| maxWorkerCount           | number   | 8              | The maximum number of webWorkers that can run simultaneously when calculating the Hash |
| strategy                 | Strategy | Strategy.mixed | Hash calculation strategy                                    |
| borderCount              | number   | 100            | The boundary point of hash calculation rules in 'mixed' mode |
| isCloseWorkerImmediately | boolean  | true           | Whether to destroy worker immediately after calculating the hash |

```ts
// strategy.ts
export enum Strategy {
  md5 = 'md5',
  crc32 = 'crc32',
  mixed = 'mixed',
}
```

When using the Strategy.mixed strategy, if the number of file fragments is less than the borderCount, the md5 value will be used to construct the MerkleTree; otherwise, crc32 will be used.

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
</p>
