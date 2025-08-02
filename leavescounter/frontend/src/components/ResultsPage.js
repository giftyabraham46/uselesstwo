import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getResults, exportResults } from '../services/treeApi';
import TreeVisualization from './TreeVisualization';
import ResultsStats from './ResultsStats';
import ExportButtons from './ExportButtons';

const ResultsPage = () => {
  const { sessionId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await getResults(sessionId);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await exportResults(sessionId, format);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button className="btn" onClick={loadResults}>
          Try Again
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="error">
        <h3>No Results Found</h3>
        <p>Results for session {sessionId} could not be found.</p>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="card">
        <h2>🌳 Tree Analysis Results</h2>
        <p>Session ID: <code>{sessionId}</code></p>
        
        {results.created_at && (
          <p>Analyzed on: {new Date(results.created_at).toLocaleString()}</p>
        )}
      </div>

      {/* Main Statistics */}
      <ResultsStats results={results} />

      {/* Detailed Analysis */}
      <div className="result-grid">
        {/* Dimensions Card */}
        <div className="card">
          <h3>📏 Tree Dimensions</h3>
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
            <div className="stat-item">
              <div className="stat-value">{results.dimensions.height.toFixed(2)}</div>
              <div className="stat-label">Height ({results.dimensions.unit})</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{results.dimensions.width.toFixed(2)}</div>
              <div className="stat-label">Width ({results.dimensions.unit})</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{results.dimensions.depth.toFixed(2)}</div>
              <div className="stat-label">Depth ({results.dimensions.unit})</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{(results.dimensions.confidence * 100).toFixed(1)}%</div>
              <div className="stat-label">Confidence</div>
            </div>
          </div>
        </div>

        {/* Leaf Analysis Card */}
        <div className="card">
          <h3>🍃 Leaf Analysis</h3>
          <div style={{ marginTop: '16px' }}>
            <div className="stat-item" style={{ marginBottom: '12px' }}>
              <div className="stat-value">{results.leaf_analysis.estimated_leaf_count.toLocaleString()}</div>
              <div className="stat-label">Estimated Leaf Count</div>
            </div>
            <div className="stat-item" style={{ marginBottom: '12px' }}>
              <div className="stat-value">{results.leaf_analysis.average_leaf_size.toFixed(1)}</div>
              <div className="stat-label">Avg Leaf Size (pixels²)</div>
            </div>
            {results.leaf_analysis.leaf_type && (
              <div className="stat-item" style={{ marginBottom: '12px' }}>
                <div className="stat-value">{results.leaf_analysis.leaf_type}</div>
                <div className="stat-label">Leaf Type</div>
              </div>
            )}
            <div className="stat-item">
              <div className="stat-value">{(results.leaf_analysis.edge_density * 100).toFixed(2)}%</div>
              <div className="stat-label">Edge Density</div>
            </div>
          </div>

          {/* Dominant Colors */}
          {results.leaf_analysis.dominant_colors && results.leaf_analysis.dominant_colors.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="stat-label">Dominant Colors</div>
              <div className="color-palette">
                {results.leaf_analysis.dominant_colors.map((color, index) => (
                  <div
                    key={index}
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                    title={color}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3D Foliage Data Card */}
        <div className="card">
          <h3>🎯 3D Model Data</h3>
          <div style={{ marginTop: '16px' }}>
            <div className="stat-item" style={{ marginBottom: '12px' }}>
              <div className="stat-value">{results.foliage_data.volume.toFixed(2)}</div>
              <div className="stat-label">Volume (cubic units)</div>
            </div>
            <div className="stat-item" style={{ marginBottom: '12px' }}>
              <div className="stat-value">{results.foliage_data.density.toFixed(4)}</div>
              <div className="stat-label">Foliage Density</div>
            </div>
            <div className="stat-item" style={{ marginBottom: '12px' }}>
              <div className="stat-value">{results.foliage_data.vertex_count.toLocaleString()}</div>
              <div className="stat-label">Vertices</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{results.foliage_data.face_count.toLocaleString()}</div>
              <div className="stat-label">Faces</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <TreeVisualization results={results} />

      {/* Export Options */}
      <ExportButtons sessionId={sessionId} onExport={handleExport} />
    </div>
  );
};

export default ResultsPage;
