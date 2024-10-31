import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import Spinner from './Spinner';
import { isNa } from './Utils';
import { useWallet } from './WalletContext';
import ContractAbi from './ContractAbi.json'
import { convertUsdToEth } from './ConvertUsdToEth';


// dotenv.config;

function CreateEscrow(props) {

    // const [senderAddr, setSenderAddr] = useState(null);
    const [recAddr, setRecAddr] = useState(null);
    const [loading, setLoading] = useState(false);
    const [links, setLinks] = useState([]);
    const {connectWallet, signer} = useWallet();

    const contract_address = "0x76444803e62b256f543a340c50eee2b2969fc0e2";

    // useEffect(() => setSender(signer), [signer]);

    const makeLinks = (uid) => {
        return ["/reference/" + uid, "/validate/" + uid, "/complete/" + uid, "/release_fund/" + uid];
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!signer) {
            console.log("Please connect the wallet");
            try {
                await connectWallet();
                console.log("Wallet connected");
                // After connecting, check if signer is still not null
                
            } catch (error) {
                console.error("Failed to connect wallet:", error);
                return;
            }
        }

        if (signer) {

            let body = {
                "sender": await signer.getAddress(),
                "receiver": recAddr,
                // "value": valAddr,
                "components": props.data["components"]
            }

            try {
                setLoading(true); // Set loading state before making the request
                const response = await axios.post('https://172-104-140-210.ip.linodeusercontent.com/escrow_kaia', body, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (response.status === 200) {                    
                    const uid = response.data["id"];
                    const amount = await convertUsdToEth(props.data["components"]["amount"]);
                    const date = new Date(props.data["components"]["expiration"]);
                    const UnixTime = Math.floor(date.getTime() / 1000);
                    const condition_raw =  ethers.toUtf8Bytes(props.data["components"]["condition"]);
                    const condition_bytes = await ethers.sha256(condition_raw);

                    const senderAddress = await signer.getAddress();
                    console.log("Amout: ", amount);
                    const balance = await signer.provider.getBalance(await signer.getAddress());
                    if(ethers.formatEther(balance) < amount) {
                        console.log("Balance of user: ", ethers.formatEther(balance));
                        window.alert("Insufficient funds");
                        return;
                    }

                    const contract = new ethers.Contract(contract_address, ContractAbi, signer);
                    const tx = await contract.createEscrow(
                        uid,
                        senderAddress,
                        "0x0000000000000000000000000000000000000000",
                        ethers.parseEther(amount.toString()),
                        recAddr,
                        UnixTime,
                        condition_bytes,
                        {
                            value: ethers.parseEther(amount.toString())
                        }
                    );

                    await tx.wait();

                    setLinks(makeLinks(uid));
                    console.log('Escrow created successfully');
                }
            } catch (error) {
                console.error('Error creating escrow:', error);
            } finally {
                setLoading(false); // Ensure loading state is reset
            }
        }
    };

    if (loading) {
        return <Spinner />
    }

    if (links.length > 0) {
        return (
            <div className='relative mx-auto w-5/6 flex justify-center'>
                <div className='relative m-auto p-2.5 pb-4 rounded shadow-md w-1/3 bg-slate-100 text-center'>
                    <div className="relative w-full block">
                        <span className="text-2xl mb-5 font-bold">Escrow created successfully &#127881;</span>
                        <span className="text-xl mb-10 font-semibold block underline"> <a href={links[0]} className='text-blue-700' >Click here to view your escrow</a></span>
                    </div>
                    <div className="relative w-full block mt-10 text-left">

                        <h2 class="mb-2 text-lg font-semibold text-gray-900 ">Next steps:</h2>
                        <ol class="max-w-md space-y-1 text-gray-700 list-decimal list-inside">
                            {/* <li className='mb-4'>
                                Validate the condition from the escrow agreement is met. Send this link to <span class="font-semibold text-gray-900 ">{props.data["components"]["thirdParty"]}</span>.
                                <br />
                                <a href={links[1]} target="_blank" class="mt-2 cursor-pointer inline-flex items-center mx-auto justify-center p-3 text-base font-medium text-blue-500 rounded-lg bg-white hover:text-gray-900 hover:bg-blue-100">
                                    <span class="w-full">Validation Link</span>
                                    <svg aria-hidden="true" class="w-6 h-6 ml-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                </a>
                            </li> */}
                            <li>
                                Complete the escrow by sending the balance to reciever. Send this link to <span class="font-semibold text-gray-900 ">{props.data["components"]["reciever"]}</span>.
                                <br />
                                <a href={links[2]} target="_blank" class="mt-2 cursor-pointer inline-flex items-center mx-auto justify-center p-3 text-base font-medium text-blue-500 rounded-lg bg-white hover:text-gray-900 hover:bg-blue-100">
                                    <span class="w-full">Completion Link</span>
                                    <svg aria-hidden="true" class="w-6 h-6 ml-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                </a>
                            </li>
                            <li>
                                If you are ok with the escrow recipient's work, you can release the fund using following link. <br /> Also send this link to <span class="font-semibold text-gray-900 ">{props.data["components"]["reciever"]}</span>.<br />
                                <a href={links[3]} target="_blank" class="mt-2 cursor-pointer inline-flex items-center mx-auto justify-center p-3 text-base font-medium text-blue-500 rounded-lg bg-white hover:text-gray-900 hover:bg-blue-100">
                                    <span class="w-full"> Release Fund</span>
                                    <svg aria-hidden="true" class="w-6 h-6 ml-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                </a>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className='relative mx-auto w-5/6 flex justify-center'>
            {/* <div className='relative my-auto mr-3 h-5/6 p-2.5 pb-4 rounded shadow-md w-1/3 bg-slate-100'>

            </div> */}
            <div className='relative my-auto ml-3 p-2.5 pb-4 rounded shadow-md w-2/3 bg-slate-100'>
                <form className='w-full' onSubmit={handleSubmit}>
                    <span className="text-xl mb-4 font-bold">Fill out address information</span>
                    <br />
                    <span className="text-md mb-4">Field values derived from your document using <a href="https://openai.com/blog/chatgpt/" className='text-blue-500' target="_blank">ChatGPT</a></span>
                    <div class="grid md:grid-cols-1 mt-4 md:gap-6">
                        {/* <div class="relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg bg-slate-300">
                            <span className="text-xl font-semibold">Sender: &nbsp; {props.data["components"]["sender"]}</span>
                            <label for="sendAddr" class="block mb-2 text-sm font-medium">Sender Address</label>
                            <input onChange={(e) => setSenderAddr(e.target.value)} type="text" id="sendAddr" class="bg-gray-50 border border-gray-300 text-gray-900 mb-5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="XXXXXXXXXXXXXXXXXXXX" required />
                            <label for="valAddr" class="block mb-2 text-sm font-medium">Validator Address</label>
                            <input onChange={(e) => setValAddr(e.target.value)} type="text" id="valAddr" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="0xXXXXXXXXXXXXXXXXX" required />
                        </div> */}
                        <div class="relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg bg-slate-300">
                            <span className="text-xl font-semibold">Reciever: &nbsp; {props.data["components"]["reciever"]}</span>
                            <label for="rec_addr" class="block mb-2 text-sm font-medium">Reciever address</label>
                            <input onChange={(e) => setRecAddr(e.target.value)} type="text" id="rec_addr" class="bg-gray-50 border border-gray-300 text-gray-900 mb-5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " placeholder="0xXXXXXXXXXXXXXXXXX" required />
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 md:gap-3">
                        {/* <div class="relative col-span-2 z-0 w-full mb-6 group h-fit  pt-2">
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Validator</label>
                            <input type="email" id="email" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={props.data["components"]["thirdParty"]} disabled />
                        </div> */}
                        <div class="relative z-0 w-full mb-6 group h-fit pt-2">
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Amount (USD)</label>
                            <input type="email" id="email" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={`$${props.data["components"]["amount"]}`} disabled />
                        </div>
                        <div class="relative z-0 w-full mb-6 group h-fit pt-2">
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Expiration date</label>
                            <input type="email" id="email" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={props.data["components"]["expiration"]} disabled />
                        </div>
                    </div>

                    <label for="message" class="block mb-2 text-sm font-medium text-gray-900 ">Escrow condition</label>
                    <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border mb-5 border-gray-300 focus:ring-blue-500 focus:border-blue-500 mb-20" disabled value={props.data["components"]["condition"]}></textarea>

                    <button type="submit" class="absolute bottom-0 right-0 py-2 px-3 mb-6 mr-6 rounded text-center text-white bg-indigo-500 cursor-pointer hover:bg-indigo-400 focus:bg-indigo-600" >Create</button>

                </form>
            </div>
        </div>
    );
};

export default CreateEscrow;
