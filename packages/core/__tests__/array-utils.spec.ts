import test from 'ava'
import { getArrParts, getFileSliceLocations, readFileAsArrayBuffer } from '../src/utils'
import path from 'path'

test('getArrParts should split array into parts of given size', (t) => {
  const input = [1, 2, 3, 4, 5, 6, 7]
  const size = 3
  const expectedOutput = [[1, 2, 3], [4, 5, 6], [7]]

  const result = getArrParts<number>(input, size)

  t.deepEqual(result, expectedOutput)
})

test('getArrParts should handle empty array', (t) => {
  const input: number[] = []
  const size = 3
  const expectedOutput: number[][] = []

  const result = getArrParts<number>(input, size)

  t.deepEqual(result, expectedOutput)
})

test('getArrParts should handle size larger than array length', (t) => {
  const input = [1, 2, 3]
  const size = 5
  const expectedOutput = [[1, 2, 3]]

  const result = getArrParts<number>(input, size)

  t.deepEqual(result, expectedOutput)
})

test('getArrParts should handle size of 1', (t) => {
  const input = [1, 2, 3]
  const size = 1
  const expectedOutput = [[1], [2], [3]]

  const result = getArrParts<number>(input, size)

  t.deepEqual(result, expectedOutput)
})

test('getArrParts should handle size equal to array length', (t) => {
  const input = [1, 2, 3]
  const size = 3
  const expectedOutput = [[1, 2, 3]]

  const result = getArrParts<number>(input, size)

  t.deepEqual(result, expectedOutput)
})

test('getFileSliceLocations function slices file as expected', async (t) => {
  const baseSize = 1
  const { sliceLocation, endLocation } = await getFileSliceLocations(
    path.join(__dirname, '/fixture/mockFile.txt'),
    baseSize,
  )

  // 假设你知道fileContent的大小，可以根据它计算期望的sliceLocation值
  const expectedSliceLocation: [number, number][] = [[0, 1048575]]

  // 基于你的测试文件和baseSize计算出预期的分片
  const expectedEndLocation = 180

  t.deepEqual(sliceLocation, expectedSliceLocation, 'sliceLocation should match expected value.')
  t.is(endLocation, expectedEndLocation, 'endLocation should match expected value.')
})

test('readFileAsArrayBuffer reads specified range of file into ArrayBuffer', async (t) => {
  const filePath = path.join(__dirname, '/fixture/mockFile.txt')
  const start = 0
  const end = 180

  const arrayBuffer = await readFileAsArrayBuffer(filePath, start, end)
  const expectedLength = end - start

  // ArrayBuffer 的 byteLength 应该与请求的字节长度一致
  t.is(arrayBuffer.byteLength, expectedLength, `ArrayBuffer should be ${expectedLength} bytes long`)
})
