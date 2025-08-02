import React from 'react';
import { keralaViewpoints, getAllTypes, getViewpointsByType } from '../data/kerala-viewpoints';

const Sidebar: React.FC = () => {
    const types = getAllTypes();
    const totalViewpoints = keralaViewpoints.length;

    return (
        <div className="sidebar">
            <h2>🌴 Kerala Viewpoints</h2>
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '8px' }}>
                    {totalViewpoints} Total Locations
                </div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                    Discover waterfalls, beaches, hills, tea gardens, and more across God's Own Country
                </div>
            </div>
            
            <div className="viewpoint-stats">
                <h3>📊 Viewpoint Categories</h3>
                {types.map(type => {
                    const count = getViewpointsByType(type).length;
                    const typeEmojis: { [key: string]: string } = {
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
                        <div key={type} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid #eee'
                        }}>
                            <span style={{ fontSize: '0.9em' }}>
                                {typeEmojis[type] || '📍'} {type}
                            </span>
                            <span style={{ 
                                fontWeight: 'bold', 
                                backgroundColor: '#e3f2fd', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                fontSize: '0.8em'
                            }}>
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ 
                marginTop: '20px', 
                padding: '15px', 
                backgroundColor: '#e8f5e8', 
                borderRadius: '6px',
                fontSize: '0.9em'
            }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    🗺️ How to use:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Use the filter panel (top-right) to show/hide viewpoint types</li>
                    <li>Click on markers to see details</li>
                    <li>Use "Focus on Kerala" button to center the map</li>
                    <li>Zoom in for detailed exploration</li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;