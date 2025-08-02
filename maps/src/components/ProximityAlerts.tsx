import React, { useState, useEffect, useRef } from 'react';
import { getImageForViewpoint } from '../utils/imageHelpers';

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

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

interface ProximityAlert {
  viewpoint: ViewPoint;
  distance: number;
  direction: string;
  bearing: number;
}

interface ProximityAlertsProps {
  userPosition: GPSPosition | null;
  viewpoints: ViewPoint[];
  alertRadius?: number; // in meters
  onAlert?: (alert: ProximityAlert) => void;
}

export const ProximityAlerts: React.FC<ProximityAlertsProps> = ({
  userPosition,
  viewpoints,
  alertRadius = 500, // 500 meters default
  onAlert
}) => {
  const [currentAlerts, setCurrentAlerts] = useState<ProximityAlert[]>([]);
  const [alertHistory, setAlertHistory] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate bearing from user to viewpoint
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

  // Convert bearing to relative direction
  const getRelativeDirection = (bearing: number, userHeading: number = 0): string => {
    let relativeBearing = bearing - userHeading;
    if (relativeBearing < 0) relativeBearing += 360;
    if (relativeBearing > 360) relativeBearing -= 360;

    if (relativeBearing >= 315 || relativeBearing < 45) return 'ahead';
    if (relativeBearing >= 45 && relativeBearing < 135) return 'on your right';
    if (relativeBearing >= 135 && relativeBearing < 225) return 'behind you';
    if (relativeBearing >= 225 && relativeBearing < 315) return 'on your left';
    
    return 'nearby';
  };

  // Play alert sound
  const playAlertSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800 Hz
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio playback not available');
    }
  };

  // Check for nearby viewpoints
  useEffect(() => {
    if (!userPosition) return;

    const nearbyViewpoints: ProximityAlert[] = [];
    
    viewpoints.forEach(viewpoint => {
      const distance = calculateDistance(
        userPosition.latitude,
        userPosition.longitude,
        viewpoint.coordinates.latitude,
        viewpoint.coordinates.longitude
      );

      if (distance <= alertRadius) {
        const bearing = calculateBearing(
          userPosition.latitude,
          userPosition.longitude,
          viewpoint.coordinates.latitude,
          viewpoint.coordinates.longitude
        );

        const direction = getRelativeDirection(bearing, userPosition.heading || 0);
        
        const alert: ProximityAlert = {
          viewpoint,
          distance,
          direction,
          bearing
        };

        nearbyViewpoints.push(alert);

        // Check if this is a new alert
        const alertKey = `${viewpoint.name}-${Math.floor(distance / 100)}`;
        if (!alertHistory.has(alertKey)) {
          setAlertHistory(prev => new Set(prev).add(alertKey));
          playAlertSound();
          
          if (onAlert) {
            onAlert(alert);
          }
        }
      }
    });

    setCurrentAlerts(nearbyViewpoints);
  }, [userPosition, viewpoints, alertRadius, alertHistory, onAlert]);

  // Clear old alerts from history when user moves away
  useEffect(() => {
    if (currentAlerts.length === 0) {
      // Clear history after 30 seconds of no alerts
      const timer = setTimeout(() => {
        setAlertHistory(new Set());
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [currentAlerts]);

  // Auto-dismiss alerts after 10 seconds
  useEffect(() => {
    if (currentAlerts.length > 0) {
      const timer = setTimeout(() => {
        setCurrentAlerts([]);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [currentAlerts]);

  if (currentAlerts.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      maxWidth: '400px',
      width: '90%'
    }}>
      {currentAlerts.map((alert, index) => {
        const imagePath = getImageForViewpoint(alert.viewpoint.name);
        
        return (
          <div
            key={`${alert.viewpoint.name}-${index}`}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              animation: 'slideInDown 0.5s ease-out',
              border: '2px solid #fff',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background image with overlay */}
            {imagePath && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${imagePath})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3,
                zIndex: 1
              }} />
            )}
            
            {/* Content overlay */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Small thumbnail image */}
                  {imagePath && (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      marginRight: '10px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '2px solid rgba(255,255,255,0.8)'
                    }}>
                      <img
                        src={imagePath}
                        alt={alert.viewpoint.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>
                    {alert.viewpoint.type === 'waterfall' && '💧'}
                    {alert.viewpoint.type === 'beach' && '🏖️'}
                    {alert.viewpoint.type === 'hillview' && '⛰️'}
                    {alert.viewpoint.type === 'tea gardens' && '🍃'}
                    {alert.viewpoint.type === 'lake' && '🏞️'}
                    {alert.viewpoint.type === 'backwaters' && '🛶'}
                    {alert.viewpoint.type === 'landscape' && '🌄'}
                    {alert.viewpoint.type === 'stream' && '🏞️'}
                    {!['waterfall', 'beach', 'hillview', 'tea gardens', 'lake', 'backwaters', 'landscape', 'stream'].includes(alert.viewpoint.type) && '📍'}
                  </span>
                  
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {alert.viewpoint.name}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.9 }}>
                      {alert.viewpoint.type}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {Math.round(alert.distance)}m
                </div>
              </div>
              
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                background: 'rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                📍 {alert.direction.toUpperCase()}
              </div>
              
              {alert.viewpoint.description && (
                <div style={{
                  fontSize: '12px',
                  marginTop: '8px',
                  opacity: 0.9,
                  fontStyle: 'italic'
                }}>
                  {alert.viewpoint.description}
                </div>
              )}

              <div style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '10px',
                height: '10px',
                background: '#ff4757',
                borderRadius: '50%',
                animation: 'pulse 1s infinite'
              }} />
            </div>
          </div>
        );
      })}
      
      {/* CSS animations */}
      <style>
        {`
          @keyframes slideInDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};
