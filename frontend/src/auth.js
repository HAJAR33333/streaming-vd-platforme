const API_URL = 'http://localhost:3001'; // L'URL du backend NestJS
const TOKEN_KEY = 'studioflix_token';

function storeSession(data) {
  if (data.accessToken) {
    localStorage.setItem(TOKEN_KEY, data.accessToken);
  }

  return data.user;
}

export const auth = {
  // 1. Connexion
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Identifiants incorrects');
    }

    const data = await response.json();
    return storeSession(data);
  },

  async register(email, password, role = 'user') {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Inscription impossible');
    }

    return response.json();
  },

  // 2. Récupérer le profil de l'utilisateur connecté via le token
  async getMe() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      this.logout();
      return null;
    }

    return response.json();
  },

  // 3. Déconnexion
  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }
};
