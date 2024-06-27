import { getFileHashChunks, HashChksParam, Strategy } from 'hash-worker'

const param: HashChksParam = {
  filePath: 'filePath...',
  config: {
    strategy: Strategy.md5,
    workerCount: 8,
    isShowLog: true,
  }
}

const beforeDate = Date.now()
function main() {
  getFileHashChunks(param).then((res: any) => {
    console.log(res)
  })
}

main()


