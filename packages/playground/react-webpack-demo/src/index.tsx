import { getFileHashChunks, HashChksParam, HashChksRes, Strategy } from 'hash-worker'
import React, { useCallback, useRef } from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  const fileRef = useRef<File | null>(null)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files?.[0]) {
      fileRef.current = files[0]
    }
  }, [])

  const handleGetHash = useCallback(() => {
    const param: HashChksParam = {
      file: fileRef.current!,
      config: {
        workerCount: 6,
        strategy: Strategy.md5,
        isShowLog: true,
      },
    }

    getFileHashChunks(param).then((data: HashChksRes) => {
      console.log(data)
      alert('Calculation complete, please check the console!')
    })
  }, [])

  return (
    <>
      <div>Hello</div>
      <input type="file" onChange={handleInputChange} />
      <button onClick={handleGetHash}>get Hash</button>
    </>
  )
}

ReactDOM.createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
