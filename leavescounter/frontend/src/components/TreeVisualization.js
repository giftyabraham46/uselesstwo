import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TreeVisualization = ({ results }) => {
  // Prepare data for dimensions chart
  const dimensionsData = [
    { name: 'Height', value: results.dimensions.height, color: '#4CAF50' },
    { name: 'Width', value: results.dimensions.width, color: '#2196F3' },
    { name: 'Depth', value: results.dimensions.depth, color: '#FF9800' }
  ];

  // Prepare data for foliage analysis
  const foliageData = [
    { name: 'Volume', value: results.foliage_data.volume },
    { name: 'Density', value: results.foliage_data.density * 1000 }, // Scale for visibility
    { name: 'Leaf Count', value: results.leaf_analysis.estimated_leaf_count / 1000 } // Scale down
  ];

  const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

  return (
    <div className="card" style={{ marginTop: '24px', position: 'relative', zIndex: 1 }}>
      <h3>📊 Data Visualization</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '20px' }}>
        
        {/* Dimensions Chart */}
        <div>
          <h4>Tree Dimensions</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dimensionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)} ${results.dimensions.unit}`, 'Value']}
              />
              <Bar dataKey="value" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Foliage Analysis Pie Chart */}
        <div>
          <h4>Foliage Analysis Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={foliageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {foliageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tree Profile Visualization */}
      <div style={{ marginTop: '24px' }}>
        <h4>Tree Profile Approximation</h4>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-end', 
          height: '250px',
          background: 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)',
          borderRadius: '8px',
          padding: '30px 20px 20px 20px',
          position: 'relative',
          overflow: 'hidden',
          margin: '0 auto',
          maxWidth: '600px'
        }}>
          {/* Tree trunk */}
          <div style={{
            width: `${Math.min(30, Math.max(15, results.dimensions.width * 1.5))}px`,
            height: `${Math.min(80, Math.max(40, results.dimensions.height * 1.5))}px`,
            background: 'linear-gradient(to right, #8B4513, #A0522D)',
            borderRadius: '4px 4px 0 0',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Tree crown */}
            <div style={{
              width: `${Math.min(120, Math.max(60, results.dimensions.width * 3))}px`,
              height: `${Math.min(80, Math.max(40, results.dimensions.height * 1.5))}px`,
              background: `radial-gradient(ellipse, ${results.leaf_analysis.dominant_colors[0] || '#228B22'}, #006400)`,
              borderRadius: '50%',
              position: 'absolute',
              top: `-${Math.min(60, Math.max(30, results.dimensions.height * 1))}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              border: '2px solid #006400',
              zIndex: 0
            }}></div>
          </div>
          
          {/* Dimensions labels */}
          <div style={{ 
            position: 'absolute', 
            bottom: '8px', 
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px', 
            color: '#333',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 12px',
            borderRadius: '4px',
            zIndex: 2,
            whiteSpace: 'nowrap'
          }}>
            H: {results.dimensions.height.toFixed(1)} | W: {results.dimensions.width.toFixed(1)} | D: {results.dimensions.depth.toFixed(1)} ({results.dimensions.unit})
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualization;
