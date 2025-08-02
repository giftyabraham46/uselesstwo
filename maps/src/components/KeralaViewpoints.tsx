import React, { useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { keralaViewpoints, getViewpointsByType, getAllTypes } from '../data/kerala-viewpoints';
import { getImageForViewpoint } from '../utils/imageHelpers';

// Define the ViewPoint interface locally to avoid type conflicts
interface ViewPoint {
  name: string;
  type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  location?: string;
  district?: string;
  source?: string;
}

// Custom marker icons for different viewpoint types
const createCustomIcon = (type: string) => {
  const iconColors: { [key: string]: string } = {
    'waterfall': '#4a90e2',      // Blue
    'beach': '#f5a623',          // Orange
    'backwaters': '#7ed321',     // Green
    'hillview': '#bd10e0',       // Purple
    'tea gardens': '#50e3c2',    // Teal
    'lake': '#0077be',           // Dark Blue
    'stream': '#4a90e2',         // Light Blue
    'landscape': '#8e44ad',      // Dark Purple
    'sea': '#3498db'             // Sea Blue
  };

  const color = iconColors[type] || '#e74c3c';
  
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.8);
      position: relative;
      cursor: pointer;
      z-index: 1000;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: 'kerala-viewpoint-marker'
  });
};

// Viewpoint marker component
const ViewPointMarker: React.FC<{ viewpoint: ViewPoint }> = ({ viewpoint }) => {
  const imagePath = getImageForViewpoint(viewpoint.name);

  // Debug log for each marker
  React.useEffect(() => {
    console.log(`Rendering marker for: ${viewpoint.name} at [${viewpoint.coordinates.latitude}, ${viewpoint.coordinates.longitude}]`);
  }, [viewpoint]);

  return (
    <Marker
      position={[viewpoint.coordinates.latitude, viewpoint.coordinates.longitude]}
      icon={createCustomIcon(viewpoint.type)}
    >
      <Popup maxWidth={300} className="custom-popup">
        <div style={{ maxWidth: '280px' }}>
          {/* Image section */}
          {imagePath && (
            <div style={{ marginBottom: '12px' }}>
              <img
                src={imagePath}
                alt={viewpoint.name}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #e1e8ed'
                }}
                onError={(e) => {
                  // Hide image if it fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h3 style={{ 
            margin: '0 0 8px 0', 
            color: '#2c3e50',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {viewpoint.name}
          </h3>
          
          <div style={{ 
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ 
              background: '#f8f9fa', 
              padding: '2px 6px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              {viewpoint.type}
            </span>
          </div>
          
          {viewpoint.location && (
            <div style={{ marginBottom: '4px', fontSize: '14px' }}>
              <strong>📍 Location:</strong> {viewpoint.location}
            </div>
          )}
          
          {viewpoint.district && (
            <div style={{ marginBottom: '4px', fontSize: '14px' }}>
              <strong>🏛️ District:</strong> {viewpoint.district}
            </div>
          )}
          
          {viewpoint.description && (
            <div style={{ 
              marginTop: '8px', 
              fontSize: '13px', 
              color: '#6c757d',
              fontStyle: 'italic',
              lineHeight: '1.4'
            }}>
              {viewpoint.description}
            </div>
          )}
          
          <div style={{ 
            marginTop: '10px', 
            fontSize: '11px', 
            color: '#adb5bd',
            borderTop: '1px solid #e9ecef',
            paddingTop: '6px'
          }}>
            �️ {viewpoint.coordinates.latitude.toFixed(4)}, {viewpoint.coordinates.longitude.toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Filter component for viewpoint types
const ViewPointFilter: React.FC<{
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
}> = ({ selectedTypes, onTypeToggle }) => {
  const types = getAllTypes();
  
  const typeIcons: { [key: string]: string } = {
    'waterfall': '💧',
    'beach': '🏖️',
    'backwaters': '🛶',
    'hillview': '⛰️',
    'tea gardens': '🍃',
    'lake': '🏞️',
    'stream': '🏞️',
    'landscape': '🌄',
    'sea': '🌊'
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: '250px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
        Kerala Viewpoints
      </h4>
      <div style={{ fontSize: '0.9em', marginBottom: '10px', color: '#7f8c8d' }}>
        Total: {keralaViewpoints.length} locations
      </div>
      {types.map(type => (
        <label key={type} style={{
          display: 'block',
          marginBottom: '6px',
          cursor: 'pointer',
          fontSize: '0.9em'
        }}>
          <input
            type="checkbox"
            checked={selectedTypes.includes(type)}
            onChange={() => onTypeToggle(type)}
            style={{ marginRight: '8px' }}
          />
          <span style={{ marginRight: '6px' }}>
            {typeIcons[type] || '📍'}
          </span>
          {type} ({getViewpointsByType(type).length})
        </label>
      ))}
    </div>
  );
};

// Main component to show Kerala viewpoints on map
export const KeralaViewpoints: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(getAllTypes());
  const map = useMap();

  // Debug logging
  React.useEffect(() => {
    console.log('Kerala Viewpoints loaded:', keralaViewpoints.length);
    console.log('Available types:', getAllTypes());
    console.log('Selected types:', selectedTypes);
  }, [selectedTypes]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleFocusKerala = () => {
    // Center map on Kerala
    map.setView([10.8505, 76.2711], 7);
  };

  const visibleViewpoints = keralaViewpoints.filter(viewpoint => 
    selectedTypes.includes(viewpoint.type)
  );

  // Debug log for visible viewpoints
  React.useEffect(() => {
    console.log('Visible viewpoints:', visibleViewpoints.length);
    console.log('First 5 viewpoints:', visibleViewpoints.slice(0, 5));
    
    // Check coordinate bounds
    const latitudes = visibleViewpoints.map(v => v.coordinates.latitude);
    const longitudes = visibleViewpoints.map(v => v.coordinates.longitude);
    
    console.log('Latitude range:', Math.min(...latitudes), 'to', Math.max(...latitudes));
    console.log('Longitude range:', Math.min(...longitudes), 'to', Math.max(...longitudes));
    
    // Kerala bounds check (approximately 8.18 to 12.78 lat, 74.88 to 77.42 lng)
    const outsideBounds = visibleViewpoints.filter(v => 
      v.coordinates.latitude < 8 || v.coordinates.latitude > 13 ||
      v.coordinates.longitude < 74 || v.coordinates.longitude > 78
    );
    
    if (outsideBounds.length > 0) {
      console.warn('Viewpoints outside Kerala bounds:', outsideBounds);
    }
  }, [visibleViewpoints]);

  return (
    <>
      <ViewPointFilter 
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
      />
      
      {/* Focus on Kerala button */}
      <button
        onClick={handleFocusKerala}
        style={{
          position: 'absolute',
          bottom: '60px',
          right: '20px',
          background: '#27ae60',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '6px',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '0.9em',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        🌴 Focus on Kerala ({visibleViewpoints.length} viewpoints)
      </button>

      {/* Test button to zoom to Athirappilly Falls */}
      <button
        onClick={() => {
          const athirappilly = keralaViewpoints.find(v => v.name === "Athirappilly Falls");
          if (athirappilly) {
            map.setView([athirappilly.coordinates.latitude, athirappilly.coordinates.longitude], 12);
            console.log("Zooming to Athirappilly Falls:", athirappilly);
          }
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: '#e74c3c',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '6px',
          cursor: 'pointer',
          zIndex: 1000,
          fontSize: '0.9em',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        🔍 Test: Zoom to Athirappilly
      </button>

      {/* Render all visible viewpoint markers */}
      {visibleViewpoints.map((viewpoint, index) => (
        <ViewPointMarker key={`${viewpoint.name}-${index}`} viewpoint={viewpoint} />
      ))}
    </>
  );
};
