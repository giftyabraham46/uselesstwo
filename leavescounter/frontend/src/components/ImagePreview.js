import React, { useState, useEffect } from 'react';

const ImagePreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Cleanup
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  if (!preview) return null;

  return (
    <div style={{ position: 'relative', textAlign: 'center' }}>
      <img
        src={preview}
        alt="Preview"
        style={{
          maxWidth: '100%',
          maxHeight: '200px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
      <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
      </div>
      <button
        onClick={onRemove}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(244, 67, 54, 0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default ImagePreview;
