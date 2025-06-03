import { useRuntimeConfig } from '#app'


export const api = {

  
  async login(email: string, password: string) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciais inválidas');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro ao fazer login');
    }
  },

  async register(email: string, password: string) {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro ao criar conta');
    }
  },

  async generateUpload(file: any, userId: string){
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl

    const response = await fetch(`${apiUrl}/videos/upload-url`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ fileName: file.name, fileType: file.type,  userId: userId } ),
    });

    if (!response.ok) {
      throw new Error('Erro ao tentar fazer upload');
    }
    console.log('Response:', response);

    const { uploadUrl, key } = await response.json();

    return { uploadUrl, key };
  }
}; 