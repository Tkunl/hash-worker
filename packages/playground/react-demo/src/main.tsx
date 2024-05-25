import React from 'react'
import ReactDOM from 'react-dom/client'
import { FileHashChunksResult, getFileHashChunks, Strategy } from 'kun-hash'

function App() {
  let file: File

  function handleInputChange(e: any) {
    file = e.target.files[0]
  }

  function handleGetHash() {
    getFileHashChunks({
      file,
      strategy: Strategy.crc32,
    }).then((data: FileHashChunksResult) => {
      console.log('chunksHash', data.chunksHash)
    })
  }

  return (
    <>
      <div>Hello</div>
      <input type="file" onChange={ handleInputChange } />
      <button onClick={ handleGetHash }>get Hash</button>
    </>
  )
}

ReactDOM.createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
