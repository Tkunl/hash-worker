import { getFileHashChunks, HashChksParam, HashChksRes, Strategy } from 'hash-worker/node'

const param: HashChksParam = {
  filePath: 'D:/ChromeSetup.exe',
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
