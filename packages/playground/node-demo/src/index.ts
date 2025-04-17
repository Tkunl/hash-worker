import { getFileHashChunks, HashChksParam, HashChksRes, Strategy } from 'hash-worker/node'

const param: HashChksParam = {
  filePath: './package.json',
  config: {
    strategy: Strategy.md5,
    workerCount: 6,
  },
}

function main() {
  getFileHashChunks(param).then((res: HashChksRes) => {
    console.log(res)
  })
}

main()
