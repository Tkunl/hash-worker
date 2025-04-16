import { HashChksParam, Strategy } from 'hash-worker'
import { BenchmarkOptions, NormalizeOptions } from './types'
import { sleep } from './helper'

export abstract class Benchmark {
  private preSpeed: number[] = []
  private preWorkerCount = 1

  protected abstract buildParams(options: BenchmarkOptions): NormalizeOptions
  protected abstract logInitialMsg(): void
  protected abstract logStrategy(strategy?: Strategy): void
  protected abstract logAvgSpeed(averageSpeed: number): void
  protected abstract logCurSpeed(overTime: number, workerCount: number, speed: number): void
  protected abstract logCompletion(): void
  protected abstract getFileHashChunks(param: HashChksParam): Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async createMockFileInLocal(sizeInMB: number) {}
  protected async deleteLocalFile() {}

  async run(options: BenchmarkOptions = {}) {
    this.logInitialMsg()
    const normalizeOptions = this.buildParams(options)
    const { sizeInMB, params } = normalizeOptions
    await this.createMockFileInLocal(sizeInMB)
    this.logStrategy(normalizeOptions.params[0].config?.strategy)

    for (const param of params) {
      const workerCount = param.config!.workerCount!
      workerCount !== this.preWorkerCount && this.getAverageSpeed(workerCount)
      const beforeDate = Date.now()
      await this.getFileHashChunks(param)
      const overTime = Date.now() - beforeDate
      const speed = sizeInMB / (overTime / 1000)
      workerCount === this.preWorkerCount && this.preSpeed.push(speed)
      this.logCurSpeed(overTime, workerCount, speed)
      await sleep(1000)
    }
    this.getAverageSpeed(this.preWorkerCount)
    this.deleteLocalFile()
    this.logCompletion()
  }

  private getAverageSpeed(workerCount = 0) {
    if (this.preSpeed.length === 0) return
    const averageSpeed = this.preSpeed.reduce((acc, cur) => acc + cur, 0) / this.preSpeed.length
    this.logAvgSpeed(averageSpeed)
    this.preWorkerCount = workerCount
    this.preSpeed.length = 0
  }
}
