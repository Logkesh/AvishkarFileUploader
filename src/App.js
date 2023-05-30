import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { storage } from './firebase';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';

// Rest of your code...


function App() {
  const [fileList, setFileList] = useState([]);
  const fileRef = ref(storage, 'files/');
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
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

      imageCapture.takePhoto()
        .then((blob) => {
          setFileList((prev) => [...prev, { blob: blob, name: `photo_${v4()}.jpg` }]);
        })
        .catch((error) => {
          console.error('Error capturing photo:', error);
        });
    }
  };

  const uploadFile = (file) => {
    if (!file) return;
    const fileRef = ref(storage, `files/${file.name}`);
    uploadBytes(fileRef, file)
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
        response.items.forEach((item) => {
          getDownloadURL(item)
            .then((url) => {
              setFileList((prev) => [...prev, { url: url, name: item.name }]);
            })
            .catch((error) => {
              console.error('Error getting download URL:', error);
            });
        });
      })
      .catch((error) => {
        console.error('Error listing files:', error);
      });

    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="App">
      <div>
        <video ref={videoRef} width="400" height="300" autoPlay muted></video>
      </div>
      <div>
        {stream ? (
          <button onClick={stopCamera}>Stop Camera</button>
        ) : (
          <button onClick={startCamera}>Start Camera</button>
        )}
        <button onClick={capturePhoto} disabled={!stream}>Capture Photo</button>
      </div>
      <div>
        {fileList.map((file, index) => (
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