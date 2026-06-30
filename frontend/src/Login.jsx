import React, { useState } from 'react';
import { auth } from './auth';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await auth.login(username, password);
      // On informe le composant parent (App.jsx) que la connexion a réussi
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '8px',
      color: '#fff',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h2 style={{ textAlign: 'center', color: '#E50914', margin: '0 0 10px 0' }}>STUDIOFLIX</h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginBottom: '20px' }}>
        Connexion unique (Claims de rôles)
      </p>

      {error && (
        <div style={{ backgroundColor: 'rgba(229, 9, 20, 0.2)', color: '#E50914', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px', border: '1px solid #E50914' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Identifiant (alice, bob, carol)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Mot de passe (`password`)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', outline: 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: '#E50914',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#b80710'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#E50914'}
        >
          {loading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}