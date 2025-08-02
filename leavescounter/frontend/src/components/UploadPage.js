import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadImages, processImages } from '../services/treeApi';
import ImagePreview from './ImagePreview';
import MetadataForm from './MetadataForm';

const UploadPage = ({ onSessionCreated }) => {
  const navigate = useNavigate();
  const [frontImage, setFrontImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [metadata, setMetadata] = useState({
    camera_height: '',
    distance_from_tree: '',
    image_dpi: ''
  });
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onDropFront = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFrontImage(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const onDropSide = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSideImage(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const {
    getRootProps: getFrontRootProps,
    getInputProps: getFrontInputProps,
    isDragActive: isFrontDragActive
  } = useDropzone({
    onDrop: onDropFront,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.webp']
    },
    maxFiles: 1
  });

  const {
    getRootProps: getSideRootProps,
    getInputProps: getSideInputProps,
    isDragActive: isSideDragActive
  } = useDropzone({
    onDrop: onDropSide,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.webp']
    },
    maxFiles: 1
  });

  const handleUploadAndProcess = async () => {
    if (!frontImage || !sideImage) {
      setError('Please upload both front and side view images');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload images
      const uploadResponse = await uploadImages(frontImage, sideImage, metadata);
      const sessionId = uploadResponse.session_id;

      setSuccess('Images uploaded successfully! Processing...');
      setUploading(false);
      setProcessing(true);

      // Process images
      await processImages(sessionId);
      
      setProcessing(false);
      setSuccess('Analysis completed successfully!');
      
      // Navigate to results page
      if (onSessionCreated) {
        onSessionCreated(sessionId);
      }
      navigate(`/results/${sessionId}`);

    } catch (err) {
      setUploading(false);
      setProcessing(false);
      setError(err.message || 'An error occurred during processing');
    }
  };

  const canProcess = frontImage && sideImage && !uploading && !processing;

  return (
    <div className="upload-page">
      <div className="card">
        <h2>Upload Tree Images</h2>
        <p>Upload front and side view images of the tree for analysis</p>

        <div className="upload-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          {/* Front Image Upload */}
          <div>
            <h3>Front View</h3>
            <div
              {...getFrontRootProps()}
              className={`upload-zone ${isFrontDragActive ? 'dragover' : ''}`}
            >
              <input {...getFrontInputProps()} />
              {frontImage ? (
                <ImagePreview file={frontImage} onRemove={() => setFrontImage(null)} />
              ) : (
                <div>
                  <p>📸</p>
                  <p>Drag & drop front view image here, or click to select</p>
                  <small>Supports: JPEG, PNG, BMP, WebP</small>
                </div>
              )}
            </div>
          </div>

          {/* Side Image Upload */}
          <div>
            <h3>Side View</h3>
            <div
              {...getSideRootProps()}
              className={`upload-zone ${isSideDragActive ? 'dragover' : ''}`}
            >
              <input {...getSideInputProps()} />
              {sideImage ? (
                <ImagePreview file={sideImage} onRemove={() => setSideImage(null)} />
              ) : (
                <div>
                  <p>📸</p>
                  <p>Drag & drop side view image here, or click to select</p>
                  <small>Supports: JPEG, PNG, BMP, WebP</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Form */}
        <MetadataForm metadata={metadata} onChange={setMetadata} />

        {/* Status Messages */}
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* Processing Status */}
        {(uploading || processing) && (
          <div className="loading">
            <div className="spinner"></div>
            <span style={{ marginLeft: '12px' }}>
              {uploading ? 'Uploading images...' : 'Processing images...'}
            </span>
          </div>
        )}

        {/* Process Button */}
        <button
          className="btn"
          onClick={handleUploadAndProcess}
          disabled={!canProcess}
          style={{ marginTop: '24px', width: '100%', fontSize: '18px', padding: '16px' }}
        >
          {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Analyze Tree'}
        </button>
      </div>

      {/* Instructions */}
      <div className="card">
        <h3>📋 Instructions</h3>
        <div style={{ textAlign: 'left' }}>
          <h4>For best results:</h4>
          <ul>
            <li>🌳 Ensure the entire tree is visible in both images</li>
            <li>📐 Take front and side views at 90° angles from each other</li>
            <li>🌅 Use good lighting conditions</li>
            <li>📏 Include reference objects or provide camera metadata for accurate scaling</li>
            <li>🎯 Keep the tree centered in the frame</li>
            <li>🔍 Use high-resolution images for better leaf detection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
