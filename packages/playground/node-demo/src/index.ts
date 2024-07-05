import { getFileHashChunks, HashChksParam, Strategy } from 'hash-worker'
import { WorkerPool2 } from 'pool'

const param: HashChksParam = {
  filePath: 'C:\\Users\\O_pengcheng.song\\Downloads\\navicat170_premium_lite_cs_x64.exe',
  config: {
    strategy: Strategy.md5,
    workerCount: 8,
    isShowLog: true,
  },
}

function main() {
  getFileHashChunks(param).then((res: any) => {
    console.log(res)
  })
}

// main()

/**
 * 生成一个指定大小的 ArrayBuffer，并用随机数填充
 * @param size ArrayBuffer 的大小，以字节为单位
 * @returns 填充了随机数的 ArrayBuffer
 */
function generateRandomArrayBuffer(size: number): ArrayBuffer {
  const buffer = new ArrayBuffer(size)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < view.length; i++) {
    view[i] = Math.floor(Math.random() * 256)
  }
  return buffer
}

/**
 * 创建一个数组，其内容是指定数量的大小为 2 MB 的 ArrayBuffer
 * @param length 数组的长度
 * @returns 包含指定数量 ArrayBuffer 的数组
 */
function createArrayBufferArray(length: number): Array<ArrayBuffer> {
  const arrayBufferSize = 2 * 1024 * 1024 // 2 MB
  const result: Array<ArrayBuffer> = []

  for (let i = 0; i < length; i++) {
    result.push(generateRandomArrayBuffer(arrayBufferSize))
  }

  return result
}

async function testPool() {
  console.log('new...')
  const pool = new WorkerPool2(4)
  console.log('create...')
  await pool.create(4)
  await new Promise<void>((rs) => setTimeout(() => rs(), 1000))
  console.log(pool.pool.map((item) => item.status))
  console.log('build params...')
  const transferList = createArrayBufferArray(6)
  const fnArgs = transferList.map((item, index) => ({ buf: item, i: index * 10 }))
  const options: any = {
    fn: (arg: ArrayBuffer) => {
      console.log('arg is called in fn', arg)
      return 'abc'
    },
    fnArgs,
    transferList,
    transferBackFn:
      (transferable: ArrayBuffer, transferList: ArrayBuffer[], index: number) =>
        transferList[index] = transferable,
  }
  console.log('exec...')
  pool.exec<any>(options).then((res) => {
    console.log('res', res)
    console.log('transferList', transferList)
  })
}

testPool()
