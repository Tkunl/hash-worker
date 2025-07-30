import { getFileHashChunks, HashWorkerOptions, HashWorkerResult, Strategy } from 'hash-worker/node'

const param: HashWorkerOptions = {
  filePath: '/home/tkunl/下载/docker-desktop-amd64.deb',
  config: {
    strategy: Strategy.md5,
    workerCount: 6,
  },
}

function main() {
  getFileHashChunks(param).then((res: HashWorkerResult) => {
    console.log(res)
  })
}

main()
