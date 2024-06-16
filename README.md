## Introduce

[中文文档](./README-zh.md)

**Hash-worker** is a library for fast calculation of file hashes. 
It is based on `hash-wasm` and utilizes `WebWorkers` for parallel computation, which speeds up computation when processing file blocks. 
Hash-worker supports two hash computation algorithms: `MD5` and `CRC32`.

> [!WARNING]
> The merkleHash computed by the Hash-worker is the root hash of a MerkleTree constructed based on file block hashes.
Note that this is not directly equivalent to a hash of the file itself.

## Install

```bash
$ yarn add hash-worker
# or
$ npm install hash-worker
```

## Usage In Browser

``` ts
import { getFileHashChunks, destroyWorkerPool, HashChksRes, HashChksParam } from 'hash-worker'

function handleGetHash() {
  const param: HashChksParam = {
    file: file,
    config: {
      workerCount: 8
    }
  }
  
  getFileHashChunks(param).then((data: HashChksRes) => {
    console.log(data)
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

When Strategy.mixed strategy is used, if the number of file fragments is less than borderCount, the md5 algorithm will be used to calculate the hash value to build the MerkleTree.
Otherwise, it switches to using the crc32 algorithm for MerkleTree construction.

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
