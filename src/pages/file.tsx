import React, { ChangeEvent, useEffect, useState } from 'react'
import SparkMD5 from 'spark-md5';

export default function Files() {
    const [percent, setPercent] = useState(0)

    const readFile = async (file: File) => {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = function(e){
                resolve(reader.result)
            }
            reader.onerror = reject;
            reader.readAsBinaryString(file)
        })
    }

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files![0];
        const chunks = createChunks(file, 10*1024*1024)
        let offset = Number(localStorage.getItem(file.name) || 0);
        createHash(chunks, async (hash, chunk) => {
            await uploadChunkFile(hash, chunk, file.name, file.type, file.size, offset)
            offset += chunk.size;
            localStorage.setItem(file.name, offset + '');
            setPercent(offset / file.size)

            if (offset / file.size >= 1) {
                localStorage.removeItem(file.name)
            }
        });
    }

    const uploadChunkFile = (hash: string, chunk: Blob, name: string, type: string, size: number, offset: number) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", chunk);
            formData.append("name", name);
            formData.append("type", type);
            formData.append("hash", hash);
            formData.append("size", size + '');
            formData.append("offset", offset + '');
            
            fetch("http://localhost:3000/api/upload", {
                headers:{},
                method: 'POST',
                body: formData
            }).then(res => res.json()).then(res => {
                console.log('res', res);
                if (!res.success) {
                    reject('上传失败了')
                }
                resolve(res)
            }).catch(error => {
                reject(error)
                console.log('update error', error);
            })
        })
    }

    const createHash = (chunks: Blob[], successCallback: (hash: string, chunk: Blob, chunkSize: number) => Promise<void>) => {
        const spark = new SparkMD5();
        
        function _read(i: number){
            if (i > chunks.length - 1) {       
                return;
            }
            const fileReader = new FileReader();
            fileReader.onload = async function(e) {
                const bytes = e.target?.result;
                // 增量计算文件hash
                bytes && typeof bytes === 'string' && spark.appendBinary(bytes);
                await successCallback(spark.end(), chunks[i], 100)
                _read(i + 1);
            }
            fileReader.readAsBinaryString(chunks[i])
        }
        _read(0);
    }

    const createChunks = (file: File, chunkSize: number) => {
        const result = [];
        let _size = 0;
        while (_size < file.size) {
            result.push(file.slice(_size, _size + chunkSize));   
            _size += chunkSize;
        }
        return result;
    }
  return (
    <div>
        <input type="file" onChange={handleFileChange} />
        percent: <progress value={percent}></progress>
    </div>
  )
}
