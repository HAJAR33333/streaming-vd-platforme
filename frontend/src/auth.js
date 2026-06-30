const API_URL = 'http://localhost:3000'; // L'URL de ton backend NestJS

export const auth = {
  // 1. Connexion
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Identifiants incorrects');
    }

    const data = await response.json();
    // On sauvegarde le token JWT renvoyé par NestJS
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    return data.user; // Contient le username et le role (ex: professional)
  },

  // 2. Récupérer le profil de l'utilisateur connecté via le token
  async getMe() {
    const token = localStorage.getItem('token');
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
    localStorage.removeItem('token');
  }
};