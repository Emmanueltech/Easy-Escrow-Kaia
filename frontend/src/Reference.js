import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Spinner from './Spinner';
import { isNa } from './Utils';;


function Reference(props) {
    const [data, setData] = useState(null);
    const [acceptCounter, setAcceptCounter] = useState(0);
    const [txnData, setTxnData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completionColor, setCompletionColor] = useState("bg-white");
    const [completionText, setCompletionText] = useState(null);


    const { id } = useParams();

    const resolveCompletion = (json) => {
        if (json["fulfilled"]) {
            if (json["finished"]) {
                setCompletionColor("bg-green-200");
                setCompletionText("Actice & Funded");
                if(acceptCounter == 1) {
                    setCompletionText("Awaiting Release of Funds")
                } if(acceptCounter == 2) {
                    setCompletionText("Completed")
                }

            } else {
                setCompletionColor("bg-white");
                setCompletionText(`${json["components"]["amount"]} KLAY in Escrow: Waiting for Receiver to confirm contract`)

            }
        }
    };

    const getData = async () => {
        try {
            setLoading(true);
            console.log("id>>>>>>>", id);

            const response = await axios.get('https://172-104-140-210.ip.linodeusercontent.com/get_escrow_kaia/' + id);

            if (response.status === 200) {
                setData(response.data["reference"]);
                setTxnData(response.data["txn_data"]);
                setLoading(false);
                console.log(response.data);

                const response_accept = await axios.get('https://172-104-140-210.ip.linodeusercontent.com/get_accept_status_kaia/' + id);

                if (response_accept.status === 200) {
                    setLoading(false);
                    console.log(response_accept);
                    setAcceptCounter(response_accept.data["metadata"]["AcceptedCounter"]);
                    resolveCompletion(response.data["reference"]);

                }
            }
        } catch (error) {
            setLoading(false);
            console.error('Error referencing escrow:', error);
        }
    };

    useEffect(() => {
        getData();
    }, [acceptCounter]);


    if (loading) {
        return (
            <div className="relative m-auto flex h-screen">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="relative m-auto flex h-screen justify-center">
            <div className='relative my-auto ml-3 p-2.5 pb-4 rounded shadow-md w-2/3 bg-slate-100'>
                <form className='w-full'>
                    <span className="text-xl mb-4 font-bold">Reference your escrow</span>
                    <br />
                    <span className="text-md mb-4">Field values derived from your document using <a href="https://openai.com/blog/chatgpt/" className='text-blue-500' target="_blank">ChatGPT</a></span>
                    <br />
                    <div className="grid md:grid-cols-1 my-4 md:gap-6">
                        {/* <div className={`relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg ${data["fulfilled"] ? "bg-green-200" : "bg-white"}`}>
                            <span className="text-xl font-semibold">1. Validation Status: &nbsp; {data["fulfilled"] ? "Complete" : "Pending"} </span>
                            {data["fulfilled"] ? null :
                                <svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 mb-1 text-gray-200 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                </svg>
                            }
                        </div> */}
                        <div className={`relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg ${completionColor}`}>
                            <span className="text-xl font-semibold">Completion Status: &nbsp; {completionText}</span>
                            {/* {txnData["finished"] && txnData["closed"] ?
                                <svg aria-hidden="true" role="status" class="inline w-4 h-4 ml-3 mb-1 text-gray-200 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                </svg> : null
                            } */}
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 mt-4 md:gap-6">
                        <div className="relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg bg-slate-200">
                            <span className="text-xl font-semibold">Sender: &nbsp; {data["components"]["sender"]}</span>
                            <label for="seed" className="block mb-2 text-sm font-medium">Sender public address</label>
                            <input type="text" id="seed" className="bg-gray-50 border border-gray-300 text-gray-900 mb-5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " value={txnData["sender"]} readOnly={true} disabled />
                        </div>
                        <div className="relative z-0 w-full mb-6 group h-fit p-4 pt-2 rounded-lg bg-slate-200">
                            <span className="text-xl font-semibold">Reciever: &nbsp; {data["components"]["reciever"]}</span>
                            <label for="rec_addr" className="block mb-2 text-sm font-medium">Reciever public address</label>
                            <input type="text" id="rec_addr" className="bg-gray-50 border border-gray-300 text-gray-900 mb-5 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 " value={txnData["recipient"]} readOnly={true} disabled />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 md:gap-3">
                        {/* <div className="relative col-span-2 z-0 w-full mb-6 group h-fit  pt-2">
                            <label for="email" className="block mb-2 text-sm font-medium text-gray-900">Third party</label>
                            <input type="email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={isNa(data["components"]["thirdParty"]) ? "None" : data["components"]["thirdParty"]} readOnly={true} disabled />
                        </div> */}
                        <div className="relative z-0 w-full mb-6 group h-fit pt-2">
                            <label for="email" className="block mb-2 text-sm font-medium text-gray-900">Amount (USD)</label>
                            <input type="email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={`$${data["components"]["amount"]}`} readOnly={true} disabled />
                        </div>
                        <div className="relative z-0 w-full mb-6 group h-fit pt-2">
                            <label for="email" className="block mb-2 text-sm font-medium text-gray-900">Expiration date</label>
                            <input type="email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" value={data["components"]["expiration"]} readOnly={true} disabled />
                        </div>
                    </div>

                    <label for="message" className="block mb-2 text-sm font-medium text-gray-900 ">Escrow condition</label>
                    <textarea id="message" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border mb-5 border-gray-300 focus:ring-blue-500 focus:border-blue-500" readOnly={true} disabled value={data["components"]["condition"]}></textarea>
                </form>
            </div >
        </div >
    );
};

export default Reference;