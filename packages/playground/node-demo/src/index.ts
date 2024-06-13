import { getFileHashChunks, HashChksParam } from 'hash-worker'

const param: HashChksParam = {
  filePath: 'D:/TestVideo.mp4',
  config: {
    maxWorkerCount: 2
  }
}

const beforeDate = Date.now()
function main() {
  getFileHashChunks(param).then((res: any) => {
    const afterDate = Date.now()
    console.log(res)
    console.log(afterDate - beforeDate)
  })
}

main()


