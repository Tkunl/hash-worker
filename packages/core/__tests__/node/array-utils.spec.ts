import { getArrParts, getFileSliceLocations, readFileAsArrayBuffer } from '../../src/utils'
import path from 'path'
import { describe } from 'node:test'

test('getArrParts should split array into parts of given size', () => {
  const input = [1, 2, 3, 4, 5, 6, 7]
  const size = 3
  const expectedOutput = [[1, 2, 3], [4, 5, 6], [7]]

  const result = getArrParts(input, size)

  expect(result).toEqual(expectedOutput)
})

test('getArrParts should handle empty array', () => {
  const input: [] = []
  const size = 3
  const expectedOutput: [] = []

  const result = getArrParts(input, size)

  expect(result).toEqual(expectedOutput)
})

test('getArrParts should handle size larger than array length', () => {
  const input = [1, 2, 3]
  const size = 5
  const expectedOutput = [[1, 2, 3]]

  const result = getArrParts(input, size)

  expect(result).toEqual(expectedOutput)
})

test('getArrParts should handle size of 1', () => {
  const input = [1, 2, 3]
  const size = 1
  const expectedOutput = [[1], [2], [3]]

  const result = getArrParts(input, size)

  expect(result).toEqual(expectedOutput)
})

test('getArrParts should handle size equal to array length', () => {
  const input = [1, 2, 3]
  const size = 3
  const expectedOutput = [[1, 2, 3]]

  const result = getArrParts(input, size)

  expect(result).toEqual(expectedOutput)
})

describe('getFileSliceLocations function slices file as expected', async () => {
  let sliceLocation: [number, number][]
  let endLocation: number

  // 在所有测试运行之前，执行一次异步操作。
  beforeAll(async () => {
    const baseSize = 1
    const result = await getFileSliceLocations(
      path.join(__dirname, './../fixture/mockFile.txt'),
      baseSize,
    )

    sliceLocation = result.sliceLocation
    endLocation = result.endLocation
  })

  // 假设你知道fileContent的大小，可以根据它计算期望的sliceLocation值
  const expectedSliceLocation = [[0, 1048575]]

  // 基于你的测试文件和baseSize计算出预期的分片
  const expectedEndLocation = 180

  it('sliceLocation should match expected value.', () => {
    expect(sliceLocation).toEqual(expectedSliceLocation)
  })

  it('endLocation should match expected value.', () => {
    expect(endLocation).toBe(expectedEndLocation)
  })
})

describe('readFileAsArrayBuffer reads specified range of file into ArrayBuffer', () => {
  const filePath = path.join(__dirname, './../fixture/mockFile.txt')
  const start = 0
  const end = 180
  let arrayBuffer: ArrayBuffer
  const expectedLength = end - start

  beforeAll(async () => {
    arrayBuffer = await readFileAsArrayBuffer(filePath, start, end)
  })

  // ArrayBuffer 的 byteLength 应该与请求的字节长度一致
  it(`ArrayBuffer should be ${expectedLength} bytes long`, () => {
    expect(arrayBuffer.byteLength).toBe(expectedLength)
  })
})
