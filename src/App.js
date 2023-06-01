import React from 'react';
import { useState, useEffect, useRef } from 'react';
import './App.css';
import { storage } from './firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [fileList, setFileList] = useState([]);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

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

    const fileRef = ref(storage, file.name);
    uploadBytes(fileRef, file.blob)
      .then(() => {
        alert('File uploaded');
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStream(stream);
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });

    return () => {
      stopCamera();
    };
  }, []);

  return (
    

    <div className="App">
      <div class="title-container">
        <h1 class="title"><u>Avishkar</u></h1>
      </div>
      <div>
        <video ref={videoRef} width="400" height="300" autoPlay muted></video>
      </div>
      <div className="button-container">
        <button onClick={capturePhoto} disabled={!stream}>
          Capture Photo
        </button>
      </div>
      <div className="image-list">
        {fileList.map((file, index) => (
          <div key={index} className="image-item">
            {file.blob && <img src={URL.createObjectURL(file.blob)} alt={`Photo ${index}`} />}
            {file.url && <img src={file.url} alt={`Photo ${index}`} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
