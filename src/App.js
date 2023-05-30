import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [fileList, setFileList] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('files');
  const [folderList, setFolderList] = useState(['files']);
  const fileRef = ref(storage, '/');
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [newFolderName, setNewFolderName] = useState('');

  const handleNewFolderChange = (e) => {
    setNewFolderName(e.target.value);
  };

  const createNewFolder = () => {
    const folderName = newFolderName.trim();
    if (folderName === '') return;

    const folderRef = ref(storage, `/${folderName}/placeholder.txt`);
    uploadBytes(folderRef, new Uint8Array())
      .then(() => {
        alert('Folder created');
        setFolderList((prev) => [...prev, folderName]);
        setNewFolderName('');
      })
      .catch((error) => {
        console.error('Error creating folder:', error);
      });
  };

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStream(stream);
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);

      imageCapture
        .takePhoto()
        .then((blob) => {
          const fileName = `photo_${uuidv4()}.jpg`;
          const file = { blob, name: fileName };
          setFileList((prev) => [...prev, file]);
          uploadFile(file);
        })
        .catch((error) => {
          console.error('Error capturing photo:', error);
        });
    }
  };

  const uploadFile = (file) => {
    if (!file) return;

    const folderPath = selectedFolder === 'files' ? '' : `${selectedFolder}/`;
    const fileRef = ref(storage, `/${folderPath}${file.name}`);
    uploadBytes(fileRef, file.blob)
      .then(() => {
        alert('File uploaded');
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  };

  useEffect(() => {
    listAll(fileRef)
      .then((response) => {
        const folders = response.prefixes.map((prefix) => prefix.name);
        setFolderList(['files', ...folders]); // Include 'files' as the default option
      })
      .catch((error) => {
        console.error('Error listing folders:', error);
      });

    const folderPath = selectedFolder === 'files' ? '' : `${selectedFolder}/`;
    const folderRef = ref(storage, folderPath);
    listAll(folderRef)
      .then((response) => {
        const files = response.items;
        Promise.all(files.map((file) => getDownloadURL(file)))
          .then((urls) => {
            const updatedFileList = files.map((file, index) => ({
              url: urls[index],
              name: file.name,
            }));
            setFileList(updatedFileList);
          })
          .catch((error) => {
            console.error('Error getting download URLs:', error);
          });
      })
      .catch((error) => {
        console.error('Error listing files:', error);
      });

    return () => {
      stopCamera();
    };
  }, [selectedFolder]);

  const handleFolderChange = (e) => {
    setSelectedFolder(e.target.value);
  };

  const renderFolderOptions = () => {
    return folderList.map((folder, index) => (
      <option key={index} value={folder}>
        {folder}
      </option>
    ));
  };

  return (
    <div className="App">
      <div>
        <label>New Folder:</label>
        <input type="text" value={newFolderName} onChange={handleNewFolderChange} />
        <button onClick={createNewFolder}>Create Folder</button>
      </div>
      <div>
        <label>Select Folder:</label>
        <select value={selectedFolder} onChange={handleFolderChange}>
          {renderFolderOptions()}
        </select>
      </div>
      <div>
        <video ref={videoRef} width="400" height="300" autoPlay muted></video>
      </div>
      <div>
        {stream ? (
          <button onClick={stopCamera}>Stop Camera</button>
        ) : (
          <button onClick={startCamera}>Start Camera</button>
        )}
        <button onClick={capturePhoto} disabled={!stream}>
          Capture Photo
        </button>
      </div>
      <div>
      {fileList
        .filter(file => file.name !== 'placeholder.txt') // Exclude "placeholder.txt"
        .map((file, index) => (
          <div key={index}>
            {file.blob && <img src={URL.createObjectURL(file.blob)} alt={`Photo ${index}`} />}
            {file.url && <img src={file.url} alt={`Photo ${index}`} />}
            <a href={file.url || URL.createObjectURL(file.blob)} download={file.name}>
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
