import React from 'react';

const MetadataForm = ({ metadata, onChange }) => {
  const handleInputChange = (field, value) => {
    onChange({
      ...metadata,
      [field]: value
    });
  };

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h3>📏 Optional Metadata (for better accuracy)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Camera Height (meters)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g., 1.7"
            value={metadata.camera_height}
            onChange={(e) => handleInputChange('camera_height', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <small style={{ color: '#666' }}>Height of camera from ground</small>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Distance to Tree (meters)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g., 5.0"
            value={metadata.distance_from_tree}
            onChange={(e) => handleInputChange('distance_from_tree', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <small style={{ color: '#666' }}>Distance from camera to tree</small>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Image DPI
          </label>
          <input
            type="number"
            placeholder="e.g., 300"
            value={metadata.image_dpi}
            onChange={(e) => handleInputChange('image_dpi', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <small style={{ color: '#666' }}>Dots per inch resolution</small>
        </div>
      </div>
      <p style={{ fontSize: '14px', color: '#666', marginTop: '16px', fontStyle: 'italic' }}>
        💡 Providing camera metadata helps convert relative measurements to real-world units (meters)
      </p>
    </div>
  );
};

export default MetadataForm;
