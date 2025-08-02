import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSessions } from '../services/treeApi';

const SessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading sessions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Sessions</h3>
        <p>{error}</p>
        <button className="btn" onClick={loadSessions}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="sessions-page">
      <div className="card">
        <h2>📋 My Analysis Sessions</h2>
        <p>View and manage your tree analysis sessions</p>
      </div>

      {sessions.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No Sessions Found</h3>
            <p>You haven't analyzed any trees yet.</p>
            <Link to="/" className="btn">
              Analyze Your First Tree
            </Link>
          </div>
        </div>
      ) : (
        <div className="sessions-grid" style={{ display: 'grid', gap: '16px' }}>
          {sessions.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
};

const SessionCard = ({ session }) => {
  const createdAt = new Date(session.created_at * 1000); // Convert timestamp
  const hasResults = session.has_results;

  return (
    <div className="card" style={{ 
      border: hasResults ? '2px solid #4CAF50' : '2px solid #ddd',
      opacity: hasResults ? 1 : 0.7
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>
            Session {session.session_id.slice(0, 8)}...
          </h4>
          <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
            📅 Created: {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            📊 Status: {hasResults ? (
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>✅ Completed</span>
            ) : (
              <span style={{ color: '#FF9800', fontWeight: 'bold' }}>⏳ Processing</span>
            )}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          {hasResults ? (
            <Link 
              to={`/results/${session.session_id}`}
              className="btn"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              View Results
            </Link>
          ) : (
            <button 
              className="btn" 
              disabled
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              Processing...
            </button>
          )}
          
          <button
            onClick={() => navigator.clipboard.writeText(session.session_id)}
            style={{
              background: 'transparent',
              border: '1px solid #ddd',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            📋 Copy ID
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionsPage;
