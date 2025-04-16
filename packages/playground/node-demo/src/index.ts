import { getFileHashChunks, HashChksParam, HashChksRes, Strategy } from 'hash-worker/node'

const param: HashChksParam = {
  filePath: '/Users/tkunl/Downloads/Docker.dmg',
  config: {
    strategy: Strategy.md5,
    workerCount: 6,
    isShowLog: true,
  },
}

function main() {
  getFileHashChunks(param).then((res: HashChksRes) => {
    console.log(res)
  })
}

main()
