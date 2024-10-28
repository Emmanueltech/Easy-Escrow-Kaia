import React, { createContext, useContext, useEffect, useState } from 'react';
import {ethers, Wallet} from 'ethers';
// import WalletConnectProvider from '@walletconnect/web3-provider';

const WalletContext = createContext();

export const WalletProvider = ({children }) => {

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    React.useEffect(() => {
        !signer && connectWallet ()
    }, [])


    const connectWallet = async () => {

        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const useSigner =  await ethersProvider.getSigner();

        setProvider(ethersProvider);
        setSigner(useSigner);
    };

    const disconnectWallet = () => {
        setProvider(null);
        setSigner(null);
    };

    return (
        <WalletContext.Provider value = {{ connectWallet, disconnectWallet, provider, signer }}>
            {children}
        </WalletContext.Provider>
    )
    
};

export const useWallet = () => useContext(WalletContext);