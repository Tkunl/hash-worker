import * as chalk from 'chalk'
import { HashChksParam, Strategy, getFileHashChunks } from 'hash-worker/node'
import { Benchmark } from '../shared/benchmark'
import { FILE_PATH } from '../shared/constant'
import { BenchmarkOptions, NormalizeOptions } from '../shared/types'
import { normalizeBenchmarkOptions } from '../shared/helper'
import { createMockFileInLocal, deleteLocalFile } from './nodeHelper'

class NodeBenchmark extends Benchmark {
  chalkYellow = chalk.default.hex('#FFB049')

  protected buildParams(options: BenchmarkOptions): NormalizeOptions {
    const { sizeInMB, strategy, workerCountTobeTest } = normalizeBenchmarkOptions(options)
    return {
      sizeInMB,
      params: workerCountTobeTest.map((workerCount) => ({
        filePath: FILE_PATH,
        config: {
          workerCount,
          strategy,
          isCloseWorkerImmediately: false,
        },
      })),
    }
  }

  protected logInitialMsg(): void {
    console.log(`${this.chalkYellow!('Hash Worker Benchmark')} 🎯`)
  }

  protected logStrategy(strategy?: Strategy): void {
    console.log(`Running benchmark for ${this.chalkYellow!(strategy + ' strategy')} 🚀`)
  }

  protected logAvgSpeed(averageSpeed: number): void {
    console.log(`Average speed: ${this.chalkYellow!(averageSpeed.toFixed(2) + 'Mb/s')}`)
  }

  protected logCurSpeed(overTime: number, workerCount: number, speed: number): void {
    console.log(
      `Get file hash in: ${this.chalkYellow!(overTime + ' ms')} by using ${this.chalkYellow!(workerCount) + ' worker'}, ` +
        `speed: ${this.chalkYellow!(speed.toFixed(2) + ' Mb/s')}`,
    )
  }

  protected logCompletion(): void {
    console.log(this.chalkYellow!('Done ') + '🎈')
    process.exit(0)
  }

  protected async getFileHashChunks(param: HashChksParam): Promise<void> {
    await getFileHashChunks(param)
  }

  override createMockFileInLocal(sizeInMB: number) {
    console.log(`Creating mock file ...`)
    return createMockFileInLocal(FILE_PATH, sizeInMB)
  }

  override deleteLocalFile() {
    return deleteLocalFile(FILE_PATH)
  }
}

const instance = new NodeBenchmark()
export const benchmark = instance.run.bind(instance)
