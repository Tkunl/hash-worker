## Introduce

[中文文档](./README-zh.md)

**Hash-worker** is a library for fast calculation of file hashes. 
It is based on `hash-wasm` and utilizes `WebWorkers` for parallel computation, which speeds up computation when processing file blocks. 

Hash-worker supports two hash computation algorithms: `MD5` and `CRC32`.

Both browser `environments` and `Node.js` environments are now supported.

> [!WARNING]
> The merkleHash computed by the Hash-worker is the root hash of a MerkleTree constructed based on file block hashes.
Note that this is not directly equivalent to a hash of the file itself.

## Install

```bash
$ yarn add hash-worker
# or
$ npm install hash-worker
```

## Usage

``` ts
import { getFileHashChunks, destroyWorkerPool, HashChksRes, HashChksParam } from 'hash-worker'

function handleGetHash() {
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

## Options

**HashChksParam**

HashChksParam is used to configure the parameters needed to calculate the hash .

| filed | type   | default | description                                                                         |
| -------- | ------ | ------- |-------------------------------------------------------------------------------------|
| file     | File   | /       | Files that need to calculate the hash (required for browser environments)           |
| filePath | string | /       | Path to the file where the hash is to be calculated (required for Node environments) |
|config|Config|Config| Parameters for calculating the Hash                                                 |

**Config**

| filed                    | type     | default        | description              |
| ------------------------ | -------- | -------------- |--------------------------|
| chunkSize                | number   | 10 (MB)        |                          |
| workerCount              | number   | 8              | Number of workers turned on at the same time as the hash is calculated|
| strategy                 | Strategy | Strategy.mixed | Hash computation strategy|
| borderCount              | number   | 100            | The cutoff for the hash calculation rule in 'mixed' mode|
| isCloseWorkerImmediately | boolean  | true           | Whether to destroy the worker thread immediately when the calculation is complete|

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

**HashChksRes**

HashChksRes is the returned result after calculating the hash value.

| filed | type | description                                                          |
| ----- | ---- |----------------------------------------------------------------------|
| chunksBlob | Blob[] | In a browser environment only, the Blob[] of the file slice is returned |
| chunksHash | string[] | Hash[] for file slicing                                              |
| merkleHash | string | The merkleHash of the file                                           |
| metadata | FileMetaInfo | The metadata of the file                                             |


**FileMetaInfo**

| filed        | type   | description                                     |
| ------------ | ------ |-------------------------------------------------|
| name         | string | The name of the file used to calculate the hash |
| size         | number | File size in KB                                 |
| lastModified | number | Timestamp of the last modification of the file  |
| type         | string | file extension                                  |

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
