import { getFileHashChunks, HashChksParam } from 'hash-worker'

const param: HashChksParam = {
  filePath: 'D:/TestVideo.mp4',
  config: {
    workerCount: 1
  }
}

const beforeDate = Date.now()
function main() {
  getFileHashChunks(param).then((res: any) => {
    console.log(res)
  })
}

main()


