import React, { useState } from 'react';
import { auth } from './auth';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (isRegister && email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError('Les emails ne correspondent pas');
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const result = await auth.register(email, password, role);
        setNotice(result.message || 'Compte créé. Vérifiez votre email avant connexion.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      const user = await auth.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError('');
    setNotice('');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '420px',
      margin: '40px auto',
      padding: '32px',
      backgroundColor: '#111',
      border: '1px solid #222',
      borderRadius: '8px',
      color: '#fff',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h1 style={{ textAlign: 'center', color: '#E50914', margin: '0 0 8px 0', fontSize: '28px' }}>
        STUDIOFLIX
      </h1>
      <p style={{ textAlign: 'center', color: '#777', fontSize: '13px', marginBottom: '24px' }}>
        {isRegister ? 'Créer un accès à la plateforme' : 'Connexion à la plateforme de revue vidéo'}
      </p>

      {error && (
        <div style={{ backgroundColor: 'rgba(229, 9, 20, 0.2)', color: '#ff6b72', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px', border: '1px solid #E50914' }}>
          {error}
        </div>
      )}

      {notice && (
        <div style={{ backgroundColor: 'rgba(40, 167, 69, 0.16)', color: '#7ee29a', padding: '10px', borderRadius: '4px', fontSize: '13px', marginBottom: '15px', border: '1px solid #287d3c' }}>
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isRegister ? 'ex: nom@entreprise.com' : 'alice@studioflix.local'}
            required
            style={{ padding: '11px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', outline: 'none' }}
          />
        </div>

        {isRegister && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Confirmation email</label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              required
              style={{ padding: '11px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', outline: 'none' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', color: '#aaa' }}>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ padding: '11px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', outline: 'none' }}
          />
        </div>

        {isRegister && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#aaa' }}>Confirmation du mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{ padding: '11px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '12px', color: '#aaa' }}>Type de compte</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ padding: '11px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#222', color: '#fff', outline: 'none' }}
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            backgroundColor: '#E50914',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginTop: '8px'
          }}
        >
          {loading ? 'Veuillez patienter...' : isRegister ? "S'inscrire" : 'Se connecter'}
        </button>
      </form>

      <button
        type="button"
        onClick={switchMode}
        style={{
          width: '100%',
          marginTop: '18px',
          background: 'none',
          border: 'none',
          color: '#aaa',
          cursor: 'pointer',
          fontSize: '13px'
        }}
      >
        {isRegister ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
      </button>

      {!isRegister && (
        <p style={{ margin: '18px 0 0', color: '#666', fontSize: '12px', textAlign: 'center' }}>
          Compte démo : alice@studioflix.local avec le mot de passe password
        </p>
      )}
    </div>
  );
}
