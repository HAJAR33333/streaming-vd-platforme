import React, { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVE_ANNOTATION_WINDOW_SECONDS = 1;

const initialComments = [
  {
    id: 'comment_demo_1',
    sessionId: 'review_v1',
    videoId: 'v1',
    timestamp: 12.5,
    author: {
      id: 'u_demo_admin',
      email: 'alice@studioflix.local',
      role: 'admin',
    },
    text: 'Le titre principal n’est pas aligné.',
    createdAt: new Date().toISOString(),
    annotation: null,
  },
];

export default function VideoReviewer({ video, videoSrc, currentUser, sessionId }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const draftAnnotationRef = useRef(null);

  const [tool, setTool] = useState('pointer');
  const [color, setColor] = useState('#E50914');
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [draftAnnotation, setDraftAnnotation] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const resolvedVideo = {
    id: video?.id ?? sessionId?.replace(/^review_/, '') ?? 'video_demo',
    title: video?.title ?? 'Vidéo de revue',
    src: video?.url ?? videoSrc,
  };

  const participants = [
    {
      id: currentUser?.id ?? 'current_user',
      email: currentUser?.email ?? currentUser?.username ?? 'utilisateur@studioflix.local',
      role: currentUser?.role ?? 'user',
      status: 'connecté',
    },
    {
      id: 'demo_second_user',
      email: 'reviewer.demo@studioflix.local',
      role: 'user',
      status: 'prêt pour la démo multi-fenêtres',
    },
  ];

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const drawAnnotation = useCallback((ctx, annotation, canvas) => {
    if (!annotation?.points?.length) return;

    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = annotation.lineWidth ?? 4;
    ctx.beginPath();

    annotation.points.forEach((point, index) => {
      const x = point.x * canvas.clientWidth;
      const y = point.y * canvas.clientHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    comments.forEach((comment) => {
      const isSelected = selectedCommentId === comment.id;
      const isNearCurrentTime =
        Math.abs(comment.timestamp - currentTime) <= ACTIVE_ANNOTATION_WINDOW_SECONDS;

      if (comment.annotation && (isSelected || isNearCurrentTime)) {
        drawAnnotation(ctx, comment.annotation, canvas);
      }
    });

    if (draftAnnotationRef.current) {
      drawAnnotation(ctx, draftAnnotationRef.current, canvas);
    }
  }, [comments, currentTime, drawAnnotation, selectedCommentId]);

  useEffect(() => {
    draftAnnotationRef.current = draftAnnotation;
    redrawCanvas();
  }, [draftAnnotation, redrawCanvas]);

  useEffect(() => {
    resizeCanvas();
    redrawCanvas();

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas, resizeCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getRelativePoint = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    };
  };

  const startDrawing = (event) => {
    if (tool !== 'brush') return;

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }

    const timestamp = videoRef.current?.currentTime ?? 0;
    const firstPoint = getRelativePoint(event);
    const annotation = {
      id: `annotation_${Date.now()}`,
      type: 'freehand',
      color,
      lineWidth: 4,
      timestamp,
      points: [firstPoint],
    };

    draftAnnotationRef.current = annotation;
    setDraftAnnotation(annotation);
    setIsDrawing(true);
    setSelectedCommentId(null);
  };

  const draw = (event) => {
    if (!isDrawing || tool !== 'brush' || !draftAnnotationRef.current) return;

    const nextAnnotation = {
      ...draftAnnotationRef.current,
      points: [...draftAnnotationRef.current.points, getRelativePoint(event)],
    };

    draftAnnotationRef.current = nextAnnotation;
    setDraftAnnotation(nextAnnotation);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearDraftAnnotation = () => {
    draftAnnotationRef.current = null;
    setDraftAnnotation(null);
    setSelectedCommentId(null);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current?.currentTime ?? 0);
  };

  const handleCommentClick = (comment) => {
    if (videoRef.current) {
      videoRef.current.currentTime = comment.timestamp;
      videoRef.current.pause();
    }

    setSelectedCommentId(comment.id);
    setCurrentTime(comment.timestamp);
  };

  const handleAddComment = (event) => {
    event.preventDefault();
    if (!newComment.trim() || !videoRef.current) return;

    const timestamp = videoRef.current.currentTime;
    const authorEmail = currentUser?.email ?? currentUser?.username ?? 'utilisateur@studioflix.local';
    const annotation = draftAnnotation
      ? {
          ...draftAnnotation,
          timestamp,
        }
      : null;

    const commentData = {
      id: `comment_${Date.now()}`,
      sessionId,
      videoId: resolvedVideo.id,
      timestamp,
      author: {
        id: currentUser?.id ?? authorEmail,
        email: authorEmail,
        role: currentUser?.role ?? 'user',
      },
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      annotation,
    };

    setComments((existingComments) =>
      [...existingComments, commentData].sort((a, b) => a.timestamp - b.timestamp),
    );
    setNewComment('');
    clearDraftAnnotation();
    setTool('pointer');
  };

  const deleteComment = (event, commentId) => {
    event.stopPropagation();
    setComments((existingComments) => existingComments.filter((comment) => comment.id !== commentId));

    if (selectedCommentId === commentId) {
      setSelectedCommentId(null);
    }
  };

  const exportReviewJson = () => {
    const payload = {
      schemaVersion: 'studioflix.review.v1',
      exportedAt: new Date().toISOString(),
      sessionId,
      video: {
        id: resolvedVideo.id,
        title: resolvedVideo.title,
        source: resolvedVideo.src,
      },
      comments,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${sessionId || 'review-session'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importReviewJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      if (!Array.isArray(payload.comments)) {
        throw new Error('Format JSON invalide');
      }

      setComments(payload.comments.sort((a, b) => a.timestamp - b.timestamp));
      clearDraftAnnotation();
    } catch (error) {
      window.alert(error.message || 'Import JSON impossible');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#111', padding: '10px 20px', borderRadius: '8px', border: '1px solid #222' }}>
        <button
          onClick={() => setTool('pointer')}
          style={toolbarButtonStyle(tool === 'pointer')}
        >
          Navigation
        </button>
        <button
          onClick={() => setTool('brush')}
          style={toolbarButtonStyle(tool === 'brush')}
        >
          Dessin libre
        </button>
        <input
          aria-label="Couleur de l'annotation"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', width: '34px', height: '34px' }}
        />
        <button onClick={clearDraftAnnotation} style={toolbarButtonStyle(false)}>
          Effacer brouillon
        </button>
        <button onClick={exportReviewJson} style={toolbarButtonStyle(false)}>
          Exporter JSON
        </button>
        <button onClick={() => fileInputRef.current?.click()} style={toolbarButtonStyle(false)}>
          Importer JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={importReviewJson}
          style={{ display: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '24px', backgroundColor: '#1e1e1e', padding: '24px', borderRadius: '8px', border: '1px solid #2e2e2e', color: '#e0e0e0', height: 'calc(100vh - 200px)', minHeight: '520px' }}>
        <div style={{ flex: 2, minWidth: 0, position: 'relative', backgroundColor: '#0a0a0a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
          <video
            ref={videoRef}
            src={resolvedVideo.src}
            controls
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={resizeCanvas}
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
              inset: 0,
              pointerEvents: tool === 'brush' ? 'auto' : 'none',
              cursor: tool === 'brush' ? 'crosshair' : 'default',
            }}
          />
        </div>

        <aside style={{ flex: 1, backgroundColor: '#181818', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', border: '1px solid #2e2e2e', minWidth: '340px' }}>
          <div style={{ borderBottom: '1px solid #2e2e2e', paddingBottom: '15px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#fff' }}>Revue vidéo</h3>
            <span style={{ fontSize: '11px', color: '#888' }}>Session : <code style={{ color: '#646cff' }}>{sessionId}</code></span>
          </div>

          <section style={{ borderBottom: '1px solid #2e2e2e', paddingBottom: '14px', marginBottom: '14px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#fff' }}>Participants</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {participants.map((participant) => (
                <div key={participant.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#b3b3b3', fontSize: '12px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{participant.email}</span>
                  <span style={{ color: participant.status === 'connecté' ? '#7ee29a' : '#777' }}>{participant.status}</span>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={handleAddComment} style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder={draftAnnotation ? 'Ajoutez un commentaire au dessin...' : 'Écrivez une remarque horodatée...'}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#252525', color: '#fff', fontSize: '13px' }}
            />
            <button type="submit" style={{ padding: '10px 16px', background: '#646cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
              Ajouter au timecode {formatTime(videoRef.current?.currentTime ?? currentTime)}
            </button>
          </form>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((comment) => (
              <article
                key={comment.id}
                onClick={() => handleCommentClick(comment)}
                style={{
                  padding: '12px',
                  border: selectedCommentId === comment.id ? '1px solid #646cff' : '1px solid #2a2a2a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#202020',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comment.author?.email ?? comment.author}</span>
                  <span style={{ backgroundColor: 'rgba(100, 108, 255, 0.15)', color: '#aeb3ff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {formatTime(comment.timestamp)} {comment.annotation ? 'Dessin' : ''}
                  </span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#b3b3b3' }}>{comment.text}</p>
                <button
                  type="button"
                  onClick={(event) => deleteComment(event, comment.id)}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                >
                  Supprimer
                </button>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function toolbarButtonStyle(active) {
  return {
    padding: '8px 12px',
    background: active ? '#646cff' : '#222',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 700 : 500,
  };
}

function clamp(value) {
  return Math.min(1, Math.max(0, value));
}

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? seconds : 0;
  const mins = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
