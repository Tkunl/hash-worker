import { getFileHashChunks, isBrowser, isNode } from 'hash-worker'
import { BenchmarkOptions, NormalizeOptions } from './types'
import {
  createMockFile,
  createMockFileInLocal,
  deleteLocalFile,
  normalizeBenchmarkOptions,
  sleep,
} from './helper'

const filePath = './data.txt'
const fileName = 'data.txt'

function buildParamsForBrowser(options: BenchmarkOptions): NormalizeOptions {
  const { sizeInMB, strategy, workerCountTobeTest } = normalizeBenchmarkOptions(options)
  const mockFile = createMockFile(fileName, sizeInMB)

  return {
    sizeInMB,
    params: workerCountTobeTest.map((workerCount) => ({
      file: mockFile,
      config: {
        workerCount,
        strategy,
      },
    })),
  }
}

function buildParamsForNode(options: BenchmarkOptions): NormalizeOptions {
  const { sizeInMB, strategy, workerCountTobeTest } = normalizeBenchmarkOptions(options)

  return {
    sizeInMB,
    params: workerCountTobeTest.map((workerCount) => ({
      filePath,
      config: {
        workerCount,
        strategy,
      },
    })),
  }
}

export async function benchmark(options: BenchmarkOptions = {}) {
  const colorYellow = 'color: #FFB049;'
  console.log('%cHash Worker Benchmark 🎯', colorYellow)

  let normalizeOptions: NormalizeOptions
  if (isBrowser()) {
    console.log('Creating mock file ⏳')
    normalizeOptions = buildParamsForBrowser(options)
  } else if (isNode()) {
    normalizeOptions = buildParamsForNode(options)
  } else {
    throw new Error('Unsupported environment')
  }

  const { sizeInMB, params } = normalizeOptions

  if (isNode()) {
    console.log('Creating mock file ⏳')
    await createMockFileInLocal(filePath, sizeInMB)
  }

  let preWorkerCount = 1
  const preSpeed: number[] = []

  const getAverageSpeed = (workerCount = 0) => {
    const averageSpeed = preSpeed.reduce((acc, cur) => acc + cur, 0) / preSpeed.length
    console.log(`Average speed: %c${averageSpeed} Mb/s`, colorYellow)
    preWorkerCount = workerCount
    preSpeed.length = 0
  }

  console.log(
    `Running benchmark for %c${normalizeOptions.params[0].config?.strategy} %cstrategy 🚀`,
    colorYellow,
    '',
  )
  for (const param of params) {
    const workerCount = param.config!.workerCount!
    if (workerCount !== preWorkerCount) getAverageSpeed(workerCount)
    const beforeDate = Date.now()
    await getFileHashChunks(param)
    const overTime = Date.now() - beforeDate
    const speed = sizeInMB / (overTime / 1000)
    if (workerCount === preWorkerCount) preSpeed.push(speed)
    console.log(
      `Get file hash in: %c${overTime} ms%c by using %c${workerCount} worker%c, speed: %c${speed} Mb/s`,
      colorYellow, // 为 overTime 设置黄色
      '', // 重置为默认颜色
      colorYellow, // 为 workerCount 设置黄色
      '', // 重置为默认颜色
      colorYellow, // 为 speed 设置黄色
    )
    await sleep(1000)
  }
  getAverageSpeed(preWorkerCount)

  if (isNode()) {
    console.log('Clearing temp file ⏳')
    await deleteLocalFile(filePath)
  }

  console.log('%cDone 🎈', colorYellow)

  if (isBrowser()) {
    alert('Please check the console for benchmark information ~')
  }
}
