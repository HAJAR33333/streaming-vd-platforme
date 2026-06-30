import React, { useState } from 'react';

export default function VideoSelection({ currentUser, onSelectVideo }) {
  // Liste fictive de vidéos en adéquation avec ton multi-tenancy (R-01)
  const [videos, setVideos] = useState([
    { id: 'v1', title: 'Publicité Campagne Été 2026', duration: '01:30', url: '/video.mp4', owner: 'Alice (Pro)' },
    { id: 'v2', title: 'Teaser Produit V2 (Version Brut)', duration: '00:45', url: 'https://www.w3schools.com/html/mov_bbb.mp4', owner: 'Alice (Pro)' }
  ]);

  const [dragActive, setDragActive] = useState(false);

  // Simulation de l'upload pour le rôle Professionnel
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newVideo = {
      id: `v_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Enlève l'extension
      duration: '--:--',
      url: '/video.mp4', // On réutilise ta vidéo locale pour la démo
      owner: currentUser.username
    };

    setVideos([newVideo, ...videos]);
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Bonjour, {currentUser.username} 👋</h2>
        <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '14px' }}>
          {currentUser.role === 'professional' 
            ? 'Gérez vos projets vidéos et lancez une session de révision collaborative.' 
            : 'Sélectionnez une vidéo assignée par votre agence pour commencer les annotations.'}
        </p>
      </div>

      {/* ZONE D'UPLOAD : UNIQUEMENT POUR LE PROFESSIONNEL */}
      {currentUser.role === 'professional' && (
        <div 
          style={{
            border: '2px dashed #333',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: dragActive ? '#151515' : '#111',
            borderColor: dragActive ? '#E50914' : '#333',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '40px'
          }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e); }}
        >
          <input 
            type="file" 
            id="video-upload" 
            accept="video/*" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <label htmlFor="video-upload" style={{ cursor: 'pointer' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🎬</span>
            <span style={{ fontWeight: '600', display: 'block', color: '#fff' }}>Glissez-déposez une nouvelle vidéo</span>
            <span style={{ fontSize: '13px', color: '#666', display: 'block', marginTop: '5px' }}>ou cliquez pour parcourir vos fichiers (MP4, MOV)</span>
          </label>
        </div>
      )}

      {/* LISTE DES VIDÉOS DISPONIBLES */}
      <h3 style={{ borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px' }}>
        {currentUser.role === 'professional' ? 'Vos projets en cours' : 'Vidéos assignées'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {videos.map((vid) => (
          <div 
            key={vid.id}
            onClick={() => onSelectVideo(vid.url)}
            style={{
              backgroundColor: '#181818',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #222',
              cursor: 'pointer',
              transition: 'transform 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.borderColor = '#444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = '#222'; }}
          >
            {/* Miniature Fictive */}
            <div style={{ height: '150px', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ fontSize: '30px' }}>📺</span>
              <span style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                {vid.duration}
              </span>
            </div>
            
            {/* Infos Vidéo */}
            <div style={{ padding: '15px' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {vid.title}
              </h4>
              <span style={{ fontSize: '12px', color: '#666' }}>Propriétaire : {vid.owner}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}