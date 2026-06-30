import React, { useState, useEffect } from 'react';
import VideoReviewer from './components/VideoReviewer';
import VideoSelection from './components/VideoSelection'; // Importation de l'écran de sélection
import Login from './Login';
import { auth } from './auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null); // État pour la vidéo active

  useEffect(() => {
    async function verifyUser() {
      const loggedInUser = await auth.getMe();
      if (loggedInUser) {
        setUser(loggedInUser);
      }
      setCheckingAuth(false);
    }
    verifyUser();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setSelectedVideo(null);
  };

  if (checkingAuth) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        Chargement du Studio...
      </div>
    );
  }

  // 1. SI PAS CONNECTÉ : Écran de connexion
  if (!user) {
    return (
      <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // 2. CORPS DE L'APPLICATION (CONNECTÉ)
  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', width: '100%', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      {/* BARRE DE NAVIGATION STYLE NETFLIX */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        backgroundColor: '#111',
        borderBottom: '1px solid #1f1f1f'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#E50914', letterSpacing: '1px', cursor: 'pointer' }} onClick={() => setSelectedVideo(null)}>
            STUDIOFLIX
          </span>
          <span style={{ color: '#888', fontSize: '12px', borderLeft: '1px solid #333', paddingLeft: '10px' }}>
            {user.role === 'professional' ? 'Espace Professionnel' : 'Espace Collaborateur'}
          </span>
          {selectedVideo && (
            <button 
              onClick={() => setSelectedVideo(null)} 
              style={{ backgroundColor: '#222', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            >
              ⬅️ Changer de vidéo
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '13px', color: '#fff', backgroundColor: '#222', padding: '6px 14px', borderRadius: '4px' }}>
            👤 {user.username} <span style={{ color: '#646cff', fontSize: '11px' }}>({user.role})</span>
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: 'none', border: '1px solid #444', color: '#aaa', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      {/* ROUTING INTERNE SELON LA SÉLECTION VIDÉO */}
      <main style={{ padding: '20px 30px', boxSizing: 'border-box', width: '100%' }}>
        {!selectedVideo ? (
          <VideoSelection 
            currentUser={user} 
            onSelectVideo={(url) => setSelectedVideo(url)} 
          />
        ) : (
          <VideoReviewer 
            videoSrc={selectedVideo} 
            currentUser={user}
            sessionId="session_demo_pole1"
          />
        )}
      </main>
    </div>
  );
}

export default App;