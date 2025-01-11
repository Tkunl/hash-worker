import React from 'react'
import ReactDOM from 'react-dom/client'
import { getFileHashChunks, HashChksRes, HashChksParam } from 'hash-worker'

function App() {
  let file: File

  function handleInputChange(e: any) {
    file = e.target.files[0]
  }

  function handleGetHash() {
    const param: HashChksParam = {
      file: file!,
      config: {
        workerCount: 8,
      },
    }

    getFileHashChunks(param).then((data: HashChksRes) => {
      console.log(data)
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
