import { getFileHashChunks, HashChksParam, HashChksRes, Strategy } from 'hash-worker'

const param: HashChksParam = {
  filePath: 'filePath here ...',
  config: {
    strategy: Strategy.md5,
    workerCount: 8,
    isShowLog: true,
  },
}

function main() {
  getFileHashChunks(param).then((res: HashChksRes) => {
    console.log(res)
  })
}

main()
