interface Window {
    ethereum: import('ethers').Eip1193Provider & import('ethers').BrowserProvider & {
        isConnected: () => boolean;
        selectedAddress: string;
    };
}

declare var window: window & typeof globalThis;
