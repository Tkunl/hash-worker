import { getFileHashChunks, HashChksParam, Strategy } from 'hash-worker'

const param: HashChksParam = {
  // filePath: 'C:/MyFiles/Programs/WinTop.exe',
  filePath: 'C:/MyFiles/Programs/chrome-win.zip',
  config: {
    strategy: Strategy.crc32,
    workerCount: 8
  }
}

const beforeDate = Date.now()
function main() {
  getFileHashChunks(param).then((res: any) => {
    console.log(res)
  })
}

main()


