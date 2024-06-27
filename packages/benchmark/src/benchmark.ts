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

function buildParamsForNode(options: BenchmarkOptions): NormalizeOptions {
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

export async function benchmark(options: BenchmarkOptions) {
  console.log('=======================')

  let normalizeOptions: NormalizeOptions
  if (isBrowser()) {
    normalizeOptions = buildParamsForBrowser(options)
  } else if (isNode()) {
    normalizeOptions = buildParamsForNode(options)
  } else {
    throw new Error('Unsupported environment')
  }

  const { sizeInMB, params } = normalizeOptions
  console.log('benchmark for strategy: ' + normalizeOptions.params[0].config?.strategy)

  if (isNode()) {
    console.log('creating large file ...')
    await createMockFileInLocal(filePath, sizeInMB)
  }

  let preWorkerCount = 1
  const preSpeed: number[] = []

  const getAverageSpeed = (workerCount = 0) => {
    console.log(
      `average speed: ${preSpeed.reduce((acc, cur) => acc + cur, 0) / preSpeed.length} Mb/s`,
    )
    preWorkerCount = workerCount
    preSpeed.length = 0
  }

  console.log('running benchmark ...')
  for (const param of params) {
    const workerCount = param.config!.workerCount!
    if (workerCount !== preWorkerCount) getAverageSpeed(workerCount)
    const beforeDate = Date.now()
    await getFileHashChunks(param)
    const overTime = Date.now() - beforeDate
    const speed = sizeInMB / (overTime / 1000)
    if (workerCount === preWorkerCount) preSpeed.push(speed)
    console.log(
      `get file hash in: ${overTime} ms by using ${workerCount} worker, speed: ${speed} Mb/s`,
    )
    await sleep(1000)
  }

  if (isNode()) {
    console.log('clearing temp file ...')
    deleteLocalFile(filePath)
  }

  console.log('done ~~~')
  console.log('=======================')
}
