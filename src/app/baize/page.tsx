import React, { useEffect } from 'react'

export default function Baize (){
  useEffect(() => {
    import('@/lib/baize').then(Baize => {
      console.log('BBBB', Baize.default);
      
      Baize.default.init({dns: 'http://localhost:3003/report', apikey: 'ccc'})
    })
  }, [])

    const requestUser = async (url: string) => {
        await fetch(url).then(res => res.json())
        throw new Error('自定义失败，路径')
    }

    const fakeHandler = () => {
      throw ('错误 fake')
    }

  return (
    <div>
      <button onClick={() => requestUser('http://localhost:3000/api/get-user')}>get user</button>

      <button onClick={fakeHandler}>fakeHandler</button>
    </div>
  )
}