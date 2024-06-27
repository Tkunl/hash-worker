import { getFileHashChunks, HashChksParam, Strategy } from 'hash-worker'

export function useBenchmark(fileName: string, sizeInMB: number, strategy: Strategy) {
  function createRandomFile(fileName: string, sizeInMB: number) {
    // 每 MB 大约为 1048576 字节
    const size = sizeInMB * 1048576
    const buffer = new ArrayBuffer(size)
    let view = new Uint8Array(buffer)

    // 填充随机内容
    for (let i = 0; i < size; i++) {
      // 随机填充每个字节，这里是填充 0-255 的随机数
      // 实际应用中，你可能需要调整生成随机数的方式以达到所需的随机性
      view[i] = Math.floor(Math.random() * 256)
    }

    // 将 ArrayBuffer 转换为Blob
    let blob = new Blob([ view ], { type: 'application/octet-stream' })

    // 将 Blob 转换为File
    return new File([ blob ], fileName, { type: 'application/octet-stream' })
  }

  async function sleep(ms: number) {
    await new Promise<void>((rs) => setTimeout(() => rs(), 500))
  }

  async function benchmark() {
    console.log('=======================')
    console.log('benchmark for strategy: ' + strategy)
    console.log('creating large file ...')
    let file: File | null = createRandomFile(fileName, sizeInMB)
    const workerCountTobeTest = [ 1, 1, 1, 4, 4, 4, 8, 8, 8, 12, 12, 12, 16, 16, 16 ]

    const params: HashChksParam [] = workerCountTobeTest.map((workerCount) => ({
      file: file!,
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
        `average speed: ${ preSpeed.reduce((acc, cur) => acc + cur, 0) / (preSpeed.length) } Mb/s`,
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
        `get file hash in: ${ overTime } ms by using ${ workerCount } worker, speed: ${ speed } Mb/s`,
      )
      await sleep(1000)
    }
    getAverageSpeed()

    file = null
  }

  benchmark().then(() => {
    console.log('done ~~~')
    console.log('=======================')
  })
}
