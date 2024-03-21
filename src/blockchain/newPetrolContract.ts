import Web3 from 'web3';
import abiJSON from './abi.json';

/** 石油大亨游戏合约地址 */
export const PETROL_ADDRESS = "0x16855c2c104600eb0505266ce27ce1089adf89fd";

const newPetrolContract = (web3: Web3) => {
    return new web3.eth.Contract(abiJSON, PETROL_ADDRESS);
}

export default newPetrolContract;
