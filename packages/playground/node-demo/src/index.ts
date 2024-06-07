function createMockBlob(
  content: string,
  name: string = 'mock.txt',
  type: string = 'text/plain',
) {
  return new Blob([content], { type })
}

console.log(typeof createMockBlob('a'))
