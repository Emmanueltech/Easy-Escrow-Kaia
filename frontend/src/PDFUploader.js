import React, { useState } from 'react';
import axios from 'axios';
import Spinner from './Spinner';

function PDFUploader(props) {
  const [file, setFile] = useState(null);
  const [fileSrc, setFileSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setFileSrc(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('files', file);

    console.log(formData);

    try {
      setLoading(true);
      const response = await axios.post('https://172-104-140-210.ip.linodeusercontent.com/derive', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('File uploaded successfully');
        props.setData(response.data);
        console.log("Response Data: ", response.data);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />
  }

  return (
    <div className='relative m-auto flex h-2/3 p-2.5 pb-4 rounded shadow-md w-1/3 bg-slate-100'>
      <form onSubmit={handleSubmit} className='w-full'>
        <span className="text-xl mb-4 font-bold">Upload an Escrow Agreement</span>
        {fileSrc == null ?
          (<label for="dropzone-file" className="flex flex-col items-center justify-center w-full h-2/3 border-2 border-gray-300 mt-4 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
            <input id="dropzone-file" type="file" accept="application/pdf" onChange={handleChange} class="hidden" />
          </label>) :
          <embed className="w-full h-2/3" src={fileSrc} />
        }
        <button type="submit" class="absolute bottom-0 right-0 py-2 px-3 mb-6 mr-6 rounded text-center text-white bg-indigo-500 cursor-pointer hover:bg-indigo-400 focus:bg-indigo-600" >Upload</button>
      </form>
    </div>
  );
}

export default PDFUploader;