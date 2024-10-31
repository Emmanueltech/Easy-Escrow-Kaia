import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { useWallet } from './WalletContext';
import ContractAbi from './ContractAbi.json'
import Spinner from './Spinner';

function ReleaseFund(props) {

    const [recAccepted, setRecAccepted] = useState(false);
    const [creatorAccepted, setCreatorAccepted] = useState(false);
    const [acceptCounter, setAcceptCounter] = useState(0);
    const [clicked, setClicked] = useState(false);
    const [loading, setLoading] = useState(true);

    const { id } = useParams();
    const {connectWallet, disconnectWallet, signer} = useWallet();
    const contract_address = "0x76444803e62b256f543a340c50eee2b2969fc0e2";

    const getData = async () => {
        try {
            setLoading(true);
            console.log(parseInt(id));

            const response_accept = await axios.get('https://172-104-140-210.ip.linodeusercontent.com/get_accept_status_kaia/' + id);

            if (response_accept.status === 200) {
                setLoading(false);
                console.log(response_accept);
                setRecAccepted(response_accept.data["metadata"]["RecipientAccepted"]);
                setCreatorAccepted(response_accept.data["metadata"]["SenderAccepted"]);
                setAcceptCounter(response_accept.data["metadata"]["AcceptedCounter"]);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error referencing escrow:', error);
        }
    };

    useEffect(() => {
        getData();
    }, [recAccepted, creatorAccepted, acceptCounter]);

    const release_fund = async () => {
        if (!signer) {
            try {
                await connectWallet();
                console.log("Wallet connected");
                // After connecting, check if signer is still not null
                if (!signer) {
                    console.error("Signer is still not available after connecting.");
                    return;
                }
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                return;
            }
        }

        try {
            setLoading(true);
            // console.log("id>>>>>>>", id);
            // const response = await axios.get('https://172-104-140-210.ip.linodeusercontent.com/finish_kaia/' + id);
            // console.log("response:", response)
            // if (response.status === 200 && response.data["success"]) {
                const contract = new ethers.Contract(contract_address, ContractAbi, signer);
                const tx = await contract.releaseFund(
                    Number(id)
                );

                await tx.wait();

                console.log('Release Fund requested successfully');
                const response_accept = await axios.get('https://172-104-140-210.ip.linodeusercontent.com/get_accept_status_kaia/' + id);

                if (response_accept.status === 200) {
                    setLoading(false);
                    console.log(response_accept);
                    setRecAccepted(response_accept.data["metadata"]["RecipientAccepted"]);
                    setCreatorAccepted(response_accept.data["metadata"]["SenderAccepted"]);
                    setAcceptCounter(response_accept.data["metadata"]["AcceptedCounter"]);
                }

                // setCompleted(true);
                setLoading(false);

                setClicked(true);
            // }

        } catch (error) {
            setLoading(false);
            console.error('Error validating escrow:', error);
        }
    };


    if (loading) {
        return (
            <div className="relative m-auto flex h-screen">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="relative m-auto flex h-screen">
            <div className='relative m-auto p-2.5 pb-4 h-2/3 rounded shadow-md w-1/3 bg-slate-100'>
                <span className="text-xl mb-2 font-bold block">Release Fund</span>
                <span className="text-md mb-4 block">Sign by clicking the green button to release fund.</span>
                <br />
                <div className={`relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg ${acceptCounter == 2 ? "bg-green-200" : "bg-white"}`}>
                    <span className="text-xl font-semibold"> Status: &nbsp;  &nbsp; {acceptCounter == 2 ? "Contract Completed" : "Pending"} </span>
                    {acceptCounter == 2 ? null :
                        <svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 mb-1 text-gray-200 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                        </svg>
                    }
                </div>
                <div className = 'flex gap-4'>
                <div className={`relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg ${creatorAccepted ? "bg-green-200" : "bg-white"}`}>
                    <span className="text font-semibold"> Creator: &nbsp;  &nbsp; {creatorAccepted ? (recAccepted ? "Contract Completed" : "Release initiated") : "Pending Release"} </span>
                </div>
                <div className={`relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg ${recAccepted ? "bg-green-200" : "bg-white"}`}>
                    <span className="text font-semibold"> Receipient: &nbsp;  &nbsp; {recAccepted ? (creatorAccepted ? "Contract Completed" : "Release initiated") : "Pending Withdrawl"} </span>
                </div>

                </div>
                {(clicked || acceptCounter == 2 )? (
                    <a 
                        href={`/reference/${id}`} 
                        className="absolute object-bottom py-2 px-3 mb-6 mx-auto rounded text-center text-white bg-blue-500 cursor-pointer hover:bg-blue-400 focus:bg-blue-600"
                    >
                        Go To Reference Page
                    </a>
                ) : (
                <button   
                    type="submit"   
                    onClick={release_fund}   
                    className="absolute object-bottom py-2 px-3 mb-6 mx-auto rounded text-center text-white bg-green-500 cursor-pointer hover:bg-green-400 focus:bg-green-600"   
                    disabled={acceptCounter === 2}  
                >  
                    Release Fund
                </button>
            )}
                
            </div>
        </div>
    );
};

export default ReleaseFund;