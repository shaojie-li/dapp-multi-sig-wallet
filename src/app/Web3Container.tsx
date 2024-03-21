"use client";
import { FC } from 'react';
import { Web3Provider } from '@/web3/store';

interface Props {
    children: React.ReactNode;
}

const Web3Container: FC<Props> = ({ children }) => {
  return (
    <Web3Provider>{children}</Web3Provider>
  )
}

export default Web3Container;
