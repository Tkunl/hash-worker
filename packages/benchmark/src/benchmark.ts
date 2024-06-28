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
  let chalk: any
  let chalkYellow: any
  if (isNode()) {
    chalk = await import('chalk')
    console.log('chalk', chalk)
    console.log('chalk.yellow', chalk.yellow)
    chalkYellow = chalk.yellow
  }
  const yellow = 'color: #FFB049;'
  isBrowser() && console.log('%cHash Worker Benchmark 🎯', yellow)
  isNode() && console.log(`${ chalkYellow('Hash Worker Benchmark') } 🎯`)

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
    isBrowser() && console.log(`Average speed: %c${ averageSpeed } Mb/s`, yellow)
    isNode() && console.log(`Average speed: ${ chalkYellow(averageSpeed + 'Mb/s') }`)
    preWorkerCount = workerCount
    preSpeed.length = 0
  }

  isBrowser() && console.log(
    `Running benchmark for %c${ normalizeOptions.params[0].config?.strategy } %cstrategy 🚀`,
    yellow,
    '',
  )
  isNode() && console.log(`Running benchmark for ${ chalkYellow(normalizeOptions.params[0].config?.strategy + 'strategy') } 🚀`)

  for (const param of params) {
    const workerCount = param.config!.workerCount!
    if (workerCount !== preWorkerCount) getAverageSpeed(workerCount)
    const beforeDate = Date.now()
    await getFileHashChunks(param)
    const overTime = Date.now() - beforeDate
    const speed = sizeInMB / (overTime / 1000)
    if (workerCount === preWorkerCount) preSpeed.push(speed)
    isBrowser() && console.log(
      `Get file hash in: %c${ overTime } ms%c by using %c${ workerCount } worker%c, speed: %c${ speed } Mb/s`,
      yellow, // 为 overTime 设置黄色
      '', // 重置为默认颜色
      yellow, // 为 workerCount 设置黄色
      '', // 重置为默认颜色
      yellow, // 为 speed 设置黄色
    )
    isNode() && console.log(
      `Get file hash in: ${chalkYellow(overTime + ' ms')} by using ${chalkYellow(workerCount) + ' worker'}, speed: ${chalkYellow(speed + ' Mb/s')}`
    )
    await sleep(1000)
  }
  getAverageSpeed(preWorkerCount)

  if (isNode()) {
    console.log('Clearing temp file ⏳')
    await deleteLocalFile(filePath)
  }

  isBrowser() && console.log('%cDone 🎈', yellow)
  isNode() && console.log(chalkYellow('Done ') + '🎈')

  if (isBrowser()) {
    alert('Please check the console for benchmark information ~')
  }
}
