import { getFileHashChunks, testWorker } from 'hash-worker'

function main() {
  getFileHashChunks({
    // filePath: 'text.txt',
    // filePath: 'jdk-17.0.2_windows-x64_bin.exe',
    filePath: 'GitHubDesktopSetup-x64.exe',
  }).then((res: any) => {
    console.log(res)
  })
  // testWorker()
}

main()
