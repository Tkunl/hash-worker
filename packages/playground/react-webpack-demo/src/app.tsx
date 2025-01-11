import React from 'react'
import { getFileHashChunks, HashChksRes, HashChksParam } from 'hash-worker'

const App: React.FC = () => {
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
      alert('Calculation complete, please check the console!')
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

export default App
