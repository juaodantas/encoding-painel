import { defineStore } from 'pinia';
import { ref } from 'vue';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  nome: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref('');
  const user = ref<User | null>(null);

  // Initialize token and user from localStorage only on the client side
  if (process.client) {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      try {
        const decodedToken = jwtDecode<User>(storedToken);
        user.value = decodedToken;
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
        // Se houver erro na decodificação, limpa o token inválido
        token.value = '';
        localStorage.removeItem('token');
      }
    }
  }

  function setToken(newToken: string) {
    token.value = newToken;
    try {
      const decodedToken = jwtDecode<User>(newToken);
      user.value = decodedToken;
      if (process.client) {
        localStorage.setItem('token', newToken);
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      throw new Error('Token inválido');
    }
  }

  function logout() {
    token.value = '';
    user.value = null;
    if (process.client) {
      localStorage.removeItem('token');
    }
  }

  return { token, user, setToken, logout };
});