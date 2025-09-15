import { apiClient } from "../axios"

class AuthService {
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login/', {
        email,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('user_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  }

  async register(email, password) {
    try {
      const response = await apiClient.post('/auth/register/', {
        email,
        password
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
    }
  }

  logout() {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    const token = localStorage.getItem('user_token');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('user_token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

AuthService = new AuthService()

export default AuthService;
