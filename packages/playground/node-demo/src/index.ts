import { getFileHashChunks } from 'hash-worker'

function main() {
  getFileHashChunks({
    filePath: 'text.txt',
  }).then((res: any) => {
    console.log(res)
  })
}

main()
