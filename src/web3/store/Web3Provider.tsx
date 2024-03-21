import { FC, createContext, useEffect, useReducer, useState } from 'react';
import Web3 from 'web3';

interface Props {
    children: React.ReactNode;
}

interface Web3ContextProps {
    web3: Web3 | null;
    selectedAddress: string;
    updateSelectedAddress: () => void
}

const Web3Context = createContext<Web3ContextProps>({ web3: null, selectedAddress: "", updateSelectedAddress: () => {} });

const Web3Provider: FC<Props> = ({ children }) => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [selectedAddress, setSelectedAddress] = useState("");

    const updateSelectedAddress = () => {
        setSelectedAddress(window.ethereum.selectedAddress);
    }

    useEffect(() => {
        const web3 = new Web3(Web3.givenProvider || "https://sepolia.infura.io/v3/3a38f9bd26c44ad8b5ed415308abc2ce");
        setWeb3(web3);
        setSelectedAddress(window.ethereum?.selectedAddress);
    }, [])

    return <Web3Context.Provider value={{ web3, selectedAddress, updateSelectedAddress }}>{children}</Web3Context.Provider>
};

export { Web3Provider, Web3Context }