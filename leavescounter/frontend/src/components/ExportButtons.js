import React, { useState } from 'react';

const ExportButtons = ({ sessionId, onExport }) => {
  const [exporting, setExporting] = useState({});

  const handleExport = async (format) => {
    setExporting({ ...exporting, [format]: true });
    try {
      await onExport(format);
    } catch (error) {
      console.error(`Export failed for ${format}:`, error);
    } finally {
      setExporting({ ...exporting, [format]: false });
    }
  };

  const exportOptions = [
    { format: 'pdf', label: '📄 PDF Report', description: 'Complete analysis report' },
    { format: 'png', label: '🖼️ PNG Image', description: 'Visualization chart' },
    { format: 'obj', label: '🎯 OBJ Model', description: '3D model file' },
    { format: 'gltf', label: '✨ GLTF Model', description: 'Web-optimized 3D' }
  ];

  return (
    <div className="card">
      <h3>📥 Export Results</h3>
      <p>Download your tree analysis in various formats</p>
      
      <div className="export-buttons">
        {exportOptions.map(({ format, label, description }) => (
          <button
            key={format}
            className="export-btn"
            onClick={() => handleExport(format)}
            disabled={exporting[format]}
            style={{
              opacity: exporting[format] ? 0.6 : 1,
              cursor: exporting[format] ? 'not-allowed' : 'pointer'
            }}
          >
            {exporting[format] ? '⏳ Exporting...' : label}
            <br />
            <small style={{ fontSize: '11px', opacity: 0.8 }}>{description}</small>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        <p><strong>Export Formats:</strong></p>
        <ul style={{ textAlign: 'left', marginTop: '8px' }}>
          <li><strong>PDF:</strong> Comprehensive report with all analysis data</li>
          <li><strong>PNG:</strong> High-quality visualization charts</li>
          <li><strong>OBJ:</strong> 3D model for CAD software and Blender</li>
          <li><strong>GLTF:</strong> Web-ready 3D model for online viewing</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportButtons;
