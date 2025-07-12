import { getFileHashChunks, HashChksParam, HashChksRes, Strategy } from 'hash-worker/node'

const param: HashChksParam = {
  filePath: '/home/tkunl/下载/docker-desktop-amd64.deb',
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
