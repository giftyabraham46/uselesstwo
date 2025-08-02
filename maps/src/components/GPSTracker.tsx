import React, { useState, useEffect, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Custom vehicle icon
const createVehicleIcon = (rotation: number = 0) => {
  return L.divIcon({
    html: `<div style="
      transform: rotate(${rotation}deg);
      font-size: 20px;
      text-align: center;
      color: #2196F3;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    ">🚗</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    className: 'vehicle-marker'
  });
};

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

interface GPSTrackerProps {
  onPositionUpdate?: (position: GPSPosition) => void;
  followVehicle?: boolean;
  smoothFollow?: boolean;
  onStop?: () => void;
}

export const GPSTracker: React.FC<GPSTrackerProps> = ({
  onPositionUpdate,
  followVehicle = true,
  smoothFollow = true,
  onStop
}) => {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [heading, setHeading] = useState(0);
  const map = useMap();
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Calculate bearing/heading between two points
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Smooth map movement
  const smoothPanTo = (lat: number, lng: number) => {
    if (smoothFollow) {
      map.panTo([lat, lng], {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.1
      });
    } else {
      map.setView([lat, lng], map.getZoom());
    }
  };

  // Start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition: GPSPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading || undefined,
          speed: pos.coords.speed || undefined
        };
        
        setPosition(newPosition);
        if (followVehicle) {
          map.setView([newPosition.latitude, newPosition.longitude], 16);
        }
        
        if (onPositionUpdate) {
          onPositionUpdate(newPosition);
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setIsTracking(false);
      },
      options
    );

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        
        // Throttle updates to avoid too frequent changes
        if (now - lastUpdateRef.current < 1000) return;
        lastUpdateRef.current = now;

        const newPosition: GPSPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading || undefined,
          speed: pos.coords.speed || undefined
        };

        // Calculate heading if not provided by GPS
        if (position && !newPosition.heading) {
          const calculatedHeading = calculateBearing(
            position.latitude,
            position.longitude,
            newPosition.latitude,
            newPosition.longitude
          );
          setHeading(calculatedHeading);
        } else if (newPosition.heading) {
          setHeading(newPosition.heading);
        }

        setPosition(newPosition);
        
        if (followVehicle) {
          smoothPanTo(newPosition.latitude, newPosition.longitude);
        }
        
        if (onPositionUpdate) {
          onPositionUpdate(newPosition);
        }
      },
      (err) => {
        setError(`Location error: ${err.message}`);
      },
      options
    );
  };

  // Stop GPS tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    if (onStop) {
      onStop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* GPS Control Panel */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
          🛰️ GPS Tracker
        </h4>
        
        {!isTracking ? (
          <button
            onClick={startTracking}
            style={{
              width: '100%',
              padding: '10px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🚗 Start Tracking
          </button>
        ) : (
          <button
            onClick={stopTracking}
            style={{
              width: '100%',
              padding: '10px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop Tracking
          </button>
        )}

        {position && (
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#7f8c8d' }}>
            <div>📍 Lat: {position.latitude.toFixed(6)}</div>
            <div>📍 Lng: {position.longitude.toFixed(6)}</div>
            {position.accuracy && (
              <div>🎯 Accuracy: ±{Math.round(position.accuracy)}m</div>
            )}
            {position.speed && (
              <div>⚡ Speed: {Math.round(position.speed * 3.6)} km/h</div>
            )}
            <div>🧭 Heading: {Math.round(heading)}°</div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '10px',
            padding: '8px',
            background: '#fff5f5',
            border: '1px solid #feb2b2',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#c53030'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Vehicle marker on map */}
      {position && (
        <Marker
          position={[position.latitude, position.longitude]}
          icon={createVehicleIcon(heading)}
        />
      )}
    </>
  );
};
