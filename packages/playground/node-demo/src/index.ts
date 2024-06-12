import { getFileHashChunks, Strategy, testWorker } from 'hash-worker'

function main() {
  getFileHashChunks({
    // filePath: 'text.txt',
    filePath: 'jdk-17.0.2_windows-x64_bin.exe',
    // filePath: 'GitHubDesktopSetup-x64.exe',
    strategy: Strategy.md5
  }).then((res: any) => {
    console.log(res)
  })
}

main()

// testWorker()
