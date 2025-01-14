/**
 * [1, 2, 3, 4] => [[1, 2], [3, 4]]
 * @param chunks 原始数组
 * @param size 分 part 大小
 */
export function getArrParts<T>(chunks: any, size: number) {
  const result: T[][] = []
  let tempPart: T[] = []
  chunks.forEach((chunk: T) => {
    tempPart.push(chunk)
    if (tempPart.length === size) {
      result.push(tempPart)
      tempPart = []
    }
  })
  if (tempPart.length !== 0) result.push(tempPart)
  return result
}
