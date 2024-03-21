"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { BigNumber } from 'bignumber.js'
import { Web3Context } from "@/web3/store/Web3Provider";
import newPetrolContract, { PETROL_ADDRESS } from '@/blockchain/newPetrolContract';

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { web3, selectedAddress, updateSelectedAddress } = useContext(Web3Context);
  const newPetrolContractRef = useRef<ReturnType<typeof newPetrolContract> | null>(null);
  const [inventory, setInventory] = useState(0);
  const [myPetrol, setMyPetrol] = useState(0);

  useEffect(() => {
    if (!web3) return;
    newPetrolContractRef.current = newPetrolContract(web3);
    getInventory();
  }, [web3])

  useEffect(() => {
    if (!selectedAddress) return;
    getMyPetrol();
  }, [selectedAddress])

  const fetchGas = async (encodeABI: string, to: string, gasPrice: string) => {
    const res = await fetch(`https://api-sepolia.etherscan.io/api?module=proxy&action=eth_estimateGas&data=${encodeABI}&to=${to}&value=0&gasPrice=${gasPrice}&gas=0x186A0&apikey=QW5SMQ9RKYYA95I5G1YN67PC3TC1TP5GE3`).then(res => res.json());
    return res
  }

  // 0xe521b859000000000000000000000000d18547d702b8cd199f8f59fdda4ff5badbd5900a
  const metaMaskSendTransaction = async (ethQty: number) => {
    if (!web3 || !selectedAddress) return;

    // https://learnblockchain.cn/docs/web3.js/web3-eth.html#eth-gettransactioncount
    let nonce = await web3.eth.getTransactionCount(selectedAddress, "pending");
    let gasPrice = await web3.eth.getGasPrice();
    const amountSpend = web3.utils.toWei(ethQty, 'ether');
    const encodeABI = newPetrolContractRef.current?.methods.buyPetrol(1).encodeABI();
    // buyPetrol
    const _nonce = "0x" +  BigNumber(Number(nonce)).toString(16);
    const _gasPrice = "0x" + BigNumber(Number(gasPrice)).toString(16);
    console.log('selectedAddress', selectedAddress, _gasPrice);
    const gas = await web3.eth.estimateGas({
      data: encodeABI,
      from: selectedAddress,
      to: PETROL_ADDRESS,
      value: amountSpend
    });
    const transactionParameters = {
      nonce: _nonce,
      from: selectedAddress,
      to: PETROL_ADDRESS,
      gasPrice: _gasPrice,
      gas: '0x' + gas,
      value: amountSpend, // 1000000000000
      data: encodeABI,
    };
    const receipt = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
  });
    // const receipt = web3.eth.sendTransaction(transactionParameters);
    return receipt;
  }
  
  // 连接钱包
  // window.ethereum 是浏览器钱包插件挂载到window对象上的一个对象
  const connectWallet = async () => {
    if (selectedAddress) return;
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    accounts.length && updateSelectedAddress();
  }

  // 输入买石油的数量
  const updateBuyPetrolQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  }

  const confirmBuy = async () => {
    const buyCount = Number(inputRef.current?.value);
    if (buyCount <= 0 || isNaN(buyCount) || !web3) return;
    // 在以太坊智能合约开发中，.send() 和 .call() 是两种调用智能合约函数的方式，它们之间有一些重要的区别：

    // .call() 是一种本地调用，不会在区块链上创建交易。它仅执行合约函数并返回其返回值，但不会修改区块链状态。因此，.call() 是读取智能合约数据的一种方式。
    // .call() 可以在任何节点上执行，不需要同步到整个网络，因此执行速度较快。
    // 当调用 .call() 时，不会消耗任何以太币（gas），因为它不会在区块链上执行任何操作。

    // .send() 是一种在区块链上创建交易并执行智能合约函数的方式。它会修改区块链状态，因此会消耗以太币（gas）。
    // .send() 会返回一个 Promise，允许你监控交易的确认情况，以确定交易是否被成功执行。
    // 由于 .send() 是通过创建交易来执行的，因此它的执行速度相对较慢，并且需要等待交易被打包到区块中，确认后才会生效。

    // 总的来说，.call() 适合用于读取智能合约状态或执行不会改变状态的函数，而 .send() 则适合用于执行可能会改变智能合约状态的函数，并且需要事务确认。
    const c = await metaMaskSendTransaction(0.01);
    const result = await newPetrolContractRef.current?.methods.buyPetrol(buyCount).send({
      from: selectedAddress,
      value: String(web3.utils.toWei(0.01, "ether"))
    });
    console.log('result', c, result, BigNumber(web3.utils.toWei(0.01, "ether")).multipliedBy(0.01).toString());
    await getMyPetrol();
  }

  const getInventory = async () => {
    const inventory: number | undefined = await newPetrolContractRef.current?.methods.checkBalance().call();
    console.log('inventor', inventory);
    (typeof inventory === 'bigint' || typeof inventory === 'number') && setInventory(Number(inventory))
  }

  const getMyPetrol = async () => {
    const myPetrol: number | undefined = await newPetrolContractRef.current?.methods.petrolBalances(selectedAddress).call();
    console.log('myPetrol', myPetrol);
    (typeof myPetrol === 'bigint' || typeof myPetrol === 'number') && setMyPetrol(Number(myPetrol))
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="bg-blue-900 w-1/2 p-8 rounded-lg bg-[url('../assets/images/sea.jpeg')] bg-no-repeat bg-cover shadow-xl shadow-slate-500">
        <h1>Petrol Address - 石油交易系统</h1>
        <div className="flex space-y-6 flex-col">
          <div className="mt-4">
            <button className="bg-blue-500 py-1 px-4 rounded" onClick={connectWallet}>连接钱包</button>
          </div>

          <div className="mt-4 flex space-x-2">
            <h3>地址 Address: </h3>
            <p>{selectedAddress}</p>
          </div>

          <div className="mt-4 flex space-x-2">
            <h3>库存: </h3>
            <p>{inventory}</p>
          </div>

          <div className="mt-4 flex space-x-2">
            <h3>我的石油数量: </h3>
            <p>{myPetrol}</p>
          </div>

          <div className="mt-4 flex space-x-2">
            <input placeholder="请输入购买数量" onChange={updateBuyPetrolQuantity} ref={inputRef} />
            <button className="bg-blue-500 py-1 px-4 rounded" onClick={confirmBuy}>购买</button>
          </div>
        </div>
      </div>
    </main>
  );
}
