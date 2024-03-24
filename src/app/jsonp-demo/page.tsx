import React from 'react'

export default function JsonDemo() {
    /**
     * jsonp原理
     * 
     * **核心点：利用script标签可以跨域请求任何有效链接的特性**
     * 1. 当script访问一个跨域接口，该接口需要返回 javascript 代码，该代码为一个在浏览器环境能直接调用的函数
     * 2. 该函数的参数为返回给客户端的数据
     * 3. 客户端需要在window上定义与服务端返回一致的函数名
     * 4. 当接口请求完成，就相当于在浏览器中执行了该函数，客户端在浏览器定义的该函数就得到了执行，参数中也携带了服务端返回的数据
     */
    const requestJSONP = (url: string) => {
      /** @ts-ignore */
      window.callback = (result: any) => {
        console.log(result)
      }
      const script = document.createElement('script');
      script.setAttribute('src', url);

      script.onload = function(){
        script.remove()
      }
      document.querySelector('head')?.appendChild(script);
    }

  return (
    <div onClick={() => requestJSONP('http://localhost:3000/api/jsonp')}>
      <button>Jsonp</button>

      <button>get user</button>
    </div>
  )
}