import React, { useState, useRef, useEffect } from 'react';

export default function VideoReviewer({ videoSrc, currentUser, sessionId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#E50914'); // Rouge Netflix par défaut
  const [tool, setTool] = useState('pointer'); // pointer (lecture) ou brush (dessin)
  
  const [comments, setComments] = useState([
    { id: '1', timestamp: 12.5, author: 'Alice (Pro)', text: 'Le titre principal n’est pas aligné.', createdAt: new Date().toISOString(), drawing: null }
  ]);
  const [newComment, setNewComment] = useState('');
  
  // Sauvegarde temporaire du dessin en cours avant soumission du commentaire
  const [currentDrawing, setCurrentDrawing] = useState(null);

  // --- LOGIQUE DU CANVAS DE DESSIN ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Adapter la taille du canvas à celle du conteneur de la vidéo
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
  }, [tool]);

  const startDrawing = (e) => {
    if (tool !== 'brush') return;
    
    // Forcer la pause de la vidéo dès qu'on commence à dessiner
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = color;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || tool !== 'brush') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Sauvegarder l'image du canvas sous forme de dataURL dans l'état
    setCurrentDrawing(canvasRef.current.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCurrentDrawing(null);
  };

  // --- LOGIQUE DES COMMENTAIRES ---
  const handleCommentClick = (note) => {
    if (videoRef.current) {
      videoRef.current.currentTime = note.timestamp;
      videoRef.current.pause();
    }
    
    // Afficher le dessin associé s'il existe
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (note.drawing) {
      const img = new Image();
      img.src = note.drawing;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !videoRef.current) return;

    const timestamp = videoRef.current.currentTime;
    
    const commentData = {
      id: `comment_${Date.now()}`,
      timestamp: timestamp,
      author: currentUser?.username || 'Professionnel',
      text: newComment,
      createdAt: new Date().toISOString(),
      drawing: currentDrawing // On attache le dessin au timecode !
    };

    setComments([...comments, commentData].sort((a, b) => a.timestamp - b.timestamp));
    setNewComment('');
    clearCanvas(); // On nettoie l'écran pour la suite
    setTool('pointer'); // On repasse en mode navigation
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      {/* BARRE D'OUTILS D'ANNOTATION */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#111', padding: '10px 20px', borderRadius: '8px', border: '1px solid #222' }}>
        <button 
          onClick={() => setTool('pointer')} 
          style={{ padding: '6px 12px', background: tool === 'pointer' ? '#646cff' : '#222', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🔍 Mode Navigation (Play)
        </button>
        <button 
          onClick={() => setTool('brush')} 
          style={{ padding: '6px 12px', background: tool === 'brush' ? '#646cff' : '#222', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          ✏️ Mode Dessin (Pause Auto)
        </button>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          style={{ border: 'none', background: 'none', cursor: 'pointer', width: '30px', height: '30px' }}
        />
        <button 
          onClick={clearCanvas} 
          style={{ padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          🗑️ Effacer l'écran
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', backgroundColor: '#1e1e1e', padding: '24px', borderRadius: '12px', border: '1px solid #2e2e2e', color: '#e0e0e0', height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        
        {/* LECTEUR VIDÉO + OVERLAY CANVAS */}
        <div style={{ flex: 2, position: 'relative', backgroundColor: '#0a0a0a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: tool === 'brush' ? 'auto' : 'none', // Bloque le clic si on est en mode navigation
              cursor: tool === 'brush' ? 'crosshair' : 'default'
            }}
          />
        </div>

        {/* SIDEBAR DE DISCUSSIONS */}
        <div style={{ flex: 1, backgroundColor: '#181818', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid #2e2e2e', minWidth: '320px' }}>
          <div style={{ borderBottom: '1px solid #2e2e2e', paddingBottom: '15px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>Flux de Revue Synchrone</h3>
            <span style={{ fontSize: '11px', color: '#888' }}>ID Session : <code style={{ color: '#646cff' }}>{sessionId}</code></span>
          </div>

          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={tool === 'brush' ? "Dessinez puis tapez votre note ici..." : "Écrivez une remarque..."}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#252525', color: '#fff', fontSize: '13px' }}
            />
            <button type="submit" style={{ padding: '10px 16px', background: '#646cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Noter
            </button>
          </form>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((c) => (
              <div
                key={c.id}
                onClick={() => handleCommentClick(c)}
                style={{ padding: '12px', border: '1px solid #2a2a2a', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#202020' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{c.author}</span>
                  <span style={{ backgroundColor: 'rgba(100, 108, 255, 0.15)', color: '#646cff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px' }}>
                    ⏱️ {formatTime(c.timestamp)} {c.drawing && '🎨'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}