export class MockBlob extends Blob {
  constructor(...args: ConstructorParameters<typeof Blob>) {
    super(...args)
  }

  // 模拟 arrayBuffer 方法
  arrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as ArrayBuffer)
        } else {
          reject(new Error('ArrayBuffer is null'))
        }
      }
      reader.onerror = () => {
        reject(new Error('FileReader failed to read the Blob'))
      }
      reader.readAsArrayBuffer(this)
    })
  }
}
