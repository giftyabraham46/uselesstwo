import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import UploadPage from './components/UploadPage';
import ResultsPage from './components/ResultsPage';
import SessionsPage from './components/SessionsPage';
import './App.css';

function App() {
  const [currentSession, setCurrentSession] = useState(null);

  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route 
              path="/" 
              element={
                <UploadPage 
                  onSessionCreated={setCurrentSession} 
                />
              } 
            />
            <Route 
              path="/results/:sessionId" 
              element={<ResultsPage />} 
            />
            <Route 
              path="/sessions" 
              element={<SessionsPage />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
