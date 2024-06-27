import { createLargeFile, deleteFile, sleep } from './helper.js'
import { getFileHashChunks, HashChksParam, Strategy } from 'hash-worker'

const filePath = './data.txt'
const sizeInMB = 500
const strategy = Strategy.md5

async function benchmark() {
  console.log('=======================')
  console.log('benchmark for strategy: ' + strategy)
  console.log('creating large file ...')
  await createLargeFile(filePath, sizeInMB)
  await sleep(100)

  const workerCountTobeTest = [ 1, 1, 1, 4, 4, 4, 8, 8, 8, 12, 12, 12 ]
  const params: HashChksParam [] = workerCountTobeTest.map((workerCount) => ({
    filePath,
    config: {
      workerCount,
      strategy,
    },
  }))

  console.log('running benchmark ...')
  let preWorkerCount = 1
  const preSpeed: number [] = []

  const getAverageSpeed = (workerCount = 0) => {
    console.log(
      `average speed: ${ preSpeed.reduce((acc, cur) => acc + cur, 0) / (preSpeed.length) } Mb/s`
    )
    preWorkerCount = workerCount
    preSpeed.length = 0
  }

  for (const param of params) {
    const workerCount = param.config!.workerCount!
    if (workerCount !== preWorkerCount) getAverageSpeed(workerCount)
    const beforeDate = Date.now()
    const res = await getFileHashChunks(param)
    const overTime = Date.now() - beforeDate
    const speed = sizeInMB / (overTime / 1000)
    if (workerCount === preWorkerCount) preSpeed.push(speed)
    console.log(
      `get file hash in: ${ overTime } ms by using ${ workerCount } worker, speed: ${ speed } Mb/s`
    )
    await sleep(1000)
  }
  getAverageSpeed()

  console.log('clearing temp file ...')
  deleteFile(filePath)
}

benchmark().then(() => {
  console.log('done ~~~')
  console.log('=======================')
})
