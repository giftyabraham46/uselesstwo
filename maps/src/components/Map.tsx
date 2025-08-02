import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import L from 'leaflet';
import { KeralaViewpoints } from './KeralaViewpoints';
import { GPSTracker } from './GPSTracker';
import { ProximityAlerts } from './ProximityAlerts';
import { keralaViewpoints } from '../data/kerala-viewpoints';

// Fix default icon paths for Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

const Map = () => {
    const [userPosition, setUserPosition] = useState<GPSPosition | null>(null);
    const [gpsEnabled, setGpsEnabled] = useState(false);

    // Custom component to invalidate size on mount
    const InvalidateSize = () => {
        const map = useMap();
        useEffect(() => {
            map.invalidateSize();
        }, [map]);
        return null;
    };

    const handlePositionUpdate = (position: GPSPosition) => {
        setUserPosition(position);
    };

    const handleGPSToggle = (enabled: boolean) => {
        setGpsEnabled(enabled);
        if (!enabled) {
            setUserPosition(null);
        }
    };

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
            <MapContainer
                center={[10.8505, 76.2711]} // Centered on Kerala
                zoom={7}
                scrollWheelZoom={true}
                style={{ height: '100vh', width: '100%' }}
                minZoom={1}
                maxZoom={18}
            >
                <InvalidateSize />
                {/* Clean world map with ocean blue background like in your image */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    subdomains={['a', 'b', 'c', 'd']}
                />
                {/* Add Kerala viewpoints */}
                <KeralaViewpoints />
                {/* Add GPS tracking */}
                {gpsEnabled && (
                    <GPSTracker 
                        onPositionUpdate={handlePositionUpdate}
                        followVehicle={true}
                        smoothFollow={true}
                        onStop={() => handleGPSToggle(false)}
                    />
                )}
            </MapContainer>
            
            {/* GPS Control Panel */}
            {!gpsEnabled && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000,
                    background: '#fff',
                    padding: '15px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    border: '2px solid #667eea'
                }}>
                    <button
                        onClick={() => setGpsEnabled(true)}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        🚗 Start GPS Tracking
                    </button>
                </div>
            )}

            {/* Proximity Alerts */}
            {userPosition && (
                <ProximityAlerts
                    userPosition={userPosition}
                    viewpoints={keralaViewpoints}
                    alertRadius={500} // 500 meters
                    onAlert={(alert) => {
                        console.log('Proximity Alert:', alert);
                    }}
                />
            )}
        </div>
    );
};

export default Map;