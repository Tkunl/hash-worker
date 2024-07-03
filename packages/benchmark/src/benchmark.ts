import { getFileHashChunks, Strategy } from 'hash-worker'
import { BenchmarkOptions, NormalizeOptions } from './types'
import {
  createMockFile,
  createMockFileInLocal,
  deleteLocalFile,
  normalizeBenchmarkOptions,
  sleep,
} from './helper'
import { ChalkInstance } from 'chalk'
import { isBrowser, isNode } from 'shared-tools'

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
  const isNodeEnv = isNode()
  const isBrowserEnv = isBrowser()
  const yellow = 'color: #FFB049;'
  let chalkYellow: ChalkInstance

  await initChalk()

  logInitialMsg()
  let normalizeOptions: NormalizeOptions
  if (isBrowserEnv) {
    console.log('Creating mock file ⏳')
    normalizeOptions = buildParamsForBrowser(options)
  } else if (isNodeEnv) {
    normalizeOptions = buildParamsForNode(options)
  } else {
    throw new Error('Unsupported environment')
  }

  const { sizeInMB, params } = normalizeOptions

  if (isNodeEnv) {
    console.log('Creating mock file ⏳')
    await createMockFileInLocal(filePath, sizeInMB)
  }

  let preWorkerCount = 1
  const preSpeed: number[] = []

  const getAverageSpeed = (workerCount = 0) => {
    if (preSpeed.length === 0) return
    const averageSpeed = preSpeed.reduce((acc, cur) => acc + cur, 0) / preSpeed.length
    logAvgSpeed(averageSpeed)
    preWorkerCount = workerCount
    preSpeed.length = 0
  }

  logStrategy(normalizeOptions.params[0].config?.strategy)

  for (const param of params) {
    const workerCount = param.config!.workerCount!
    if (workerCount !== preWorkerCount) getAverageSpeed(workerCount)
    const beforeDate = Date.now()
    await getFileHashChunks(param)
    const overTime = Date.now() - beforeDate
    const speed = sizeInMB / (overTime / 1000)
    if (workerCount === preWorkerCount) preSpeed.push(speed)
    logCurSpeed(overTime, workerCount, speed)
    await sleep(1000)
  }
  getAverageSpeed(preWorkerCount)

  if (isNodeEnv) {
    console.log('Clearing temp file ⏳')
    await deleteLocalFile(filePath)
  }

  logCompletion()

  async function initChalk() {
    if (isNodeEnv) {
      const chalk = (await import('chalk')).default
      chalkYellow = chalk.hex('#FFB049')
    }
  }

  function logInitialMsg() {
    isBrowserEnv && console.log('%cHash Worker Benchmark 🎯', yellow)
    isNodeEnv && console.log(`${chalkYellow!('Hash Worker Benchmark')} 🎯`)
  }

  function logStrategy(strategy?: Strategy) {
    isBrowserEnv && console.log(`Running benchmark for %c${strategy} %cstrategy 🚀`, yellow, '')
    isNodeEnv && console.log(`Running benchmark for ${chalkYellow!(strategy + ' strategy')} 🚀`)
  }

  function logAvgSpeed(averageSpeed: number) {
    isBrowserEnv && console.log(`Average speed: %c${averageSpeed.toFixed(2)} Mb/s`, yellow)
    isNodeEnv && console.log(`Average speed: ${chalkYellow!(averageSpeed.toFixed(2) + 'Mb/s')}`)
  }

  function logCurSpeed(overTime: number, workerCount: number, speed: number) {
    isBrowserEnv &&
      console.log(
        `Get file hash in: %c${overTime} ms%c by using %c${workerCount} worker%c, speed: %c${speed.toFixed(2)} Mb/s`,
        yellow, // 为 overTime 设置黄色
        '', // 重置为默认颜色
        yellow, // 为 workerCount 设置黄色
        '', // 重置为默认颜色
        yellow, // 为 speed 设置黄色
      )
    isNodeEnv &&
      console.log(
        `Get file hash in: ${chalkYellow!(overTime + ' ms')} by using ${chalkYellow!(workerCount) + ' worker'}, ` +
          `speed: ${chalkYellow!(speed.toFixed(2) + ' Mb/s')}`,
      )
  }

  function logCompletion() {
    isBrowserEnv && console.log('%cDone 🎈', yellow)
    isNodeEnv && console.log(chalkYellow!('Done ') + '🎈')
    if (isBrowserEnv) {
      alert('Please check the console for benchmark information ~')
    }
  }
}
