import test from 'ava'
import { getArrParts } from '../src/utils'

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
