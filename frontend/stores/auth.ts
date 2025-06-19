import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  nome?: string; // Torne o nome opcional para lidar com tokens que não o incluem
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref('');
  const user = ref<User | null>(null);
  const isTokenLoaded = ref(false); // Flag para indicar se a carga inicial foi concluída

  // Computed para fornecer um nome de usuário com fallback
  const userName = computed(() => {
    if (!user.value) return 'Usuário';
    return user.value.nome || user.value.email?.split('@')[0] || 'Usuário';
  });

  // Verificar se o token está expirado
  const isTokenExpired = computed(() => {
    if (!token.value) return true;
    try {
      const decodedToken: any = jwtDecode(token.value);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp < currentTime;
    } catch {
      return true;
    }
  });

  // Computed para verificar autenticação de forma mais robusta
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value && !isTokenExpired.value;
  });

// Modificar setToken e initializeFromStorage para usar dados completos

function setToken(newToken: string, userData?: User) {
  try {
    const decodedToken = jwtDecode<User>(newToken);
    
    // Verificar a validade do token decodificado
    if (!decodedToken || !decodedToken.id || !decodedToken.email) {
      throw new Error('Token não contém os campos necessários');
    }
    
    token.value = newToken;
    
    // Usar dados completos do usuário se disponíveis, senão usar o token decodificado
    if (userData) {
      user.value = userData;
    } else {
      user.value = decodedToken;
    }
    
    if (process.client) {
      localStorage.setItem('token', newToken);
      if (userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
      }
    }
    
    console.log('Token definido com sucesso:', { id: user.value.id, email: user.value.email, nome: user.value.nome || 'Não definido' });
  } catch (error) {
    console.error('Erro ao definir token:', error);
    clearAuth();
    throw new Error('Token inválido');
  }
}

function initializeFromStorage() {
  if (!process.client) return;
  
  isTokenLoaded.value = false;
  const storedToken = localStorage.getItem('token');
  const storedUserData = localStorage.getItem('userData');
  
  if (storedToken) {
    try {
      const decodedToken = jwtDecode<User>(storedToken);
      
      // Verificar a validade do token decodificado
      if (decodedToken && decodedToken.id && decodedToken.email) {
        token.value = storedToken;
        
        // Preferir dados do usuário armazenados separadamente
        if (storedUserData) {
          user.value = JSON.parse(storedUserData);
        } else {
          user.value = decodedToken;
        }
        
        if (user.value) {
          console.log('Token inicializado com sucesso:', { id: user.value.id, email: user.value.email, nome: user.value.nome || 'Não definido' });
        } else {
          console.warn('Usuário não definido após inicialização do token');
        }
      } else {
        console.warn('Token decodificado não contém os campos necessários');
        clearAuth();
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      clearAuth();
    } finally {
      isTokenLoaded.value = true;
    }
  } else {
    isTokenLoaded.value = true;
  }
}
  function clearAuth() {
    token.value = '';
    user.value = null;
    if (process.client) {
      localStorage.removeItem('token');
    }
  }

  function logout() {
    clearAuth();
  }

  // Inicialização automática
  if (process.client) {
    initializeFromStorage();
  }

  return { 
    token, 
    user, 
    userName,
    isAuthenticated,
    isTokenExpired,
    isTokenLoaded,
    setToken, 
    logout,
    initializeFromStorage 
  };
});