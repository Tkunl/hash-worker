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
    const afterDate = Date.now()
    const overTime = afterDate - beforeDate
    // console.log(res)
    console.log(overTime + 'ms')
    console.log(696 / (overTime / 1000) + 'MB/s')
  })
}

main()


