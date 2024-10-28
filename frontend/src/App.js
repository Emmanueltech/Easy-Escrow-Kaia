import logo from './logo.svg';
import './App.css';
import PDFUploader from './PDFUploader';
import React, { useEffect, useState } from 'react';
import CreateEscrow from './CreateEscrow';
import { useWallet } from './WalletContext';

function App() {

  const [data, setData] = useState(null);
  const {connectWallet, disconnectWallet, signer} = useWallet();

  useEffect(() => {
    if(!signer) {
      console.log("Wallet not connected");
    }
  }, []) 

  console.log(data);

  return (
    <div className="relative m-auto flex h-screen">
      {
        data == null ? <PDFUploader setData={setData} /> : <CreateEscrow data={data} />
      }

    </div>
    // <div className="relative m-auto flex h-screen">
    //   {
    //     <CreateEscrow data={data} />
    //   }

    // </div>
  );
}

export default App;
