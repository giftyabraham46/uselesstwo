import React from 'react';

const ResultsStats = ({ results }) => {
  const volume = results.foliage_data.volume;
  const leafCount = results.leaf_analysis.estimated_leaf_count;
  const height = results.dimensions.height;
  const confidence = results.dimensions.confidence;

  return (
    <div className="result-grid">
      <div className="stat-card">
        <div className="stat-value">{height.toFixed(1)}</div>
        <div className="stat-label">Tree Height ({results.dimensions.unit})</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">{leafCount.toLocaleString()}</div>
        <div className="stat-label">Estimated Leaves</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">{volume.toFixed(1)}</div>
        <div className="stat-label">Foliage Volume</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">{(confidence * 100).toFixed(1)}%</div>
        <div className="stat-label">Analysis Confidence</div>
      </div>
    </div>
  );
};

export default ResultsStats;
