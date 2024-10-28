import React from 'react';
import pdf from './FakeEscrow.pdf';
import thumbnail from './Thumbnail.png';

function Samples() {


    return (
        <div className="relative m-auto flex h-screen">
            <div className='relative m-auto h-2/3 p-2.5 pb-4 rounded shadow-md w-1/3 bg-slate-100'>
                <span className="text-xl mb-2 font-bold block">Sample Escrow Agreement</span>
                <span className="text-md mb-4 block">Download the escrow agreement pdf that was used in the demo video.</span>
                <img src={thumbnail} alt="Escrow Agreement" className="h-1/2 mx-auto mb-4" />
                <a className="text-blue-500 underline " href={pdf} download="Escrow.pdf">Download the pdf</a>
            </div>
        </div>
    );
};

export default Samples;