import { Strategy, HashChksParam, getFileHashChunks } from 'hash-worker'
import { Benchmark } from '../shared/benchmark'
import { BenchmarkOptions, NormalizeOptions } from '../shared/types'
import { createMockFile, normalizeBenchmarkOptions } from '../shared/helper'
import { FILE_NAME } from '../shared/constant'

class BrowserBenchmark extends Benchmark {
  private readonly yellow = 'color: #FFB049;'

  protected buildParams(options: BenchmarkOptions): NormalizeOptions {
    const { sizeInMB, strategy, workerCountTobeTest } = normalizeBenchmarkOptions(options)
    console.log(`Creating mock file ...`)
    const mockFile = createMockFile(FILE_NAME, sizeInMB)

    return {
      sizeInMB,
      params: workerCountTobeTest.map((workerCount) => ({
        file: mockFile,
        config: {
          workerCount,
          strategy,
          isCloseWorkerImmediately: false,
        },
      })),
    }
  }
  protected logInitialMsg(): void {
    console.log('%cHash Worker Benchmark 🎯', this.yellow)
  }

  protected logStrategy(strategy?: Strategy): void {
    console.log(`Running benchmark for %c${strategy} %cstrategy 🚀`, this.yellow, '')
  }

  protected logAvgSpeed(averageSpeed: number): void {
    console.log(`Average speed: %c${averageSpeed.toFixed(2)} Mb/s`, this.yellow)
  }

  protected logCurSpeed(overTime: number, workerCount: number, speed: number): void {
    console.log(
      `Get file hash in: %c${overTime} ms%c by using %c${workerCount} worker%c, speed: %c${speed.toFixed(2)} Mb/s`,
      this.yellow, // 为 overTime 设置黄色
      '', // 重置为默认颜色
      this.yellow, // 为 workerCount 设置黄色
      '', // 重置为默认颜色
      this.yellow, // 为 speed 设置黄色
    )
  }

  protected logCompletion(): void {
    console.log('%cDone 🎈', this.yellow)
    alert('Please check the console for benchmark information ~')
  }

  protected async getFileHashChunks(param: HashChksParam): Promise<void> {
    await getFileHashChunks(param)
  }
}

const instance = new BrowserBenchmark()
export const benchmark = instance.run.bind(instance)
