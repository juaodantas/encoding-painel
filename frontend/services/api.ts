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
  
    try {
      console.log('Enviando requisição para gerar URL de upload...');
      console.log('Dados de envio:', { 
        fileName: file.name, 
        fileType: file.type, 
        userId: userId 
      });
      
      const response = await fetch(`${apiUrl}/videos/upload-url`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          fileName: file.name, 
          fileType: file.type, 
          userId: userId 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Erro na requisição:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData?.message || 'Erro ao tentar fazer upload');
      }
  
      // Obtenha o texto bruto da resposta primeiro para debugging
      const responseText = await response.text();
      console.log('Resposta bruta:', responseText);
      
      // Tente parsear o JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Erro ao fazer parse do JSON:', e);
        throw new Error('Resposta inválida do servidor');
      }
      
      console.log('Dados da resposta:', responseData);
      
      // Verificar se os campos esperados existem
      if (!responseData.videoId || !responseData.uploadUrl) {
        console.error('Resposta incompleta:', responseData);
        throw new Error('Resposta incompleta do servidor');
      }
      
      // Extrair os valores com segurança
      const videoId = responseData.videoId;
      const fileName = responseData.fileName || file.name; // Fallback para o nome original
      const uploadUrl = responseData.uploadUrl;
      const key = responseData.key;
      
      // Log dos valores extraídos
      console.log('Valores extraídos:', { videoId, fileName, uploadUrl, key });
  
      return { videoId, fileName, uploadUrl, key };
    } catch (error) {
      console.error('Erro em generateUpload:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Erro desconhecido ao gerar URL de upload');
    }
  },

  async getAllVideos() {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiUrl

    const response = await fetch(`${apiUrl}/videos`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar vídeos');
    }

    return await response.json();
  }
}; 