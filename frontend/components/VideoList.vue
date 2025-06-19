<template>
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Meus Vídeos</h2>
      
      <div v-if="loading && videos.length === 0" class="flex justify-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="videos.length === 0" class="text-center py-6">
        <p class="text-gray-600">Nenhum vídeo encontrado.</p>
      </div>
      
      <ul v-else class="divide-y divide-gray-200">
        <li v-for="video in videos" :key="video.id" class="py-4">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ video.name || video.fileName || 'Vídeo sem título' }}
              </p>
              <p class="text-sm text-gray-500 truncate">
                Status: <span :class="getStatusClass(video.status)">{{ video.status || 'Desconhecido' }}</span>
              </p>
            </div>
          </div>
        </li>
      </ul>
      
      <button 
        @click="refreshVideos" 
        class="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
        :disabled="loading"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ loading ? 'Atualizando...' : 'Atualizar lista' }}
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, defineExpose } from 'vue';
  import { api } from '~/services/api';
  
  const videos = ref<any[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  
  const fetchVideos = async () => {
    try {
      loading.value = true;
      error.value = null;
      const data = await api.getAllVideos();
      videos.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar vídeos';
      console.error('Erro ao carregar vídeos:', err);
    } finally {
      loading.value = false;
    }
  };
  
  const updateOrAddVideo = (updatedVideo: any) => {
  console.log('updateOrAddVideo chamado com:', updatedVideo);
  
  // Normalização dos IDs
  const videoId = updatedVideo.id || updatedVideo.videoId;
  
  if (!videoId) {
    console.error('ID do vídeo não encontrado:', updatedVideo);
    return; // Não podemos atualizar sem ID
  }
  
  // Procura por um vídeo existente com o mesmo ID
  const index = videos.value.findIndex(video => 
    video.id === videoId || 
    video.videoId === videoId
  );
  
  if (index !== -1) {
    // Atualiza o vídeo existente
    console.log(`Atualizando vídeo existente no índice ${index}`);
    videos.value[index] = {
      ...videos.value[index],
      ...updatedVideo,
      // Garanta que o ID do vídeo permaneça consistente
      id: videos.value[index].id
    };
    console.log('Vídeo atualizado:', videos.value[index]);
  } else {
    // Adiciona o novo vídeo
    console.log('Adicionando novo vídeo à lista');
    const newVideo = {
      id: videoId,
      status: updatedVideo.status || 'novo',
      fileName: updatedVideo.fileName || updatedVideo.name || 'Novo vídeo',
      ...updatedVideo
    };
    videos.value.unshift(newVideo); // Adiciona no início da lista
    console.log('Novo vídeo adicionado:', newVideo);
  }
};
  
  const getStatusClass = (status: string | undefined) => {
    if (!status) return 'text-gray-500';
    
    switch (status.toLowerCase()) {
      case 'uploaded':
      case 'complete':
      case 'success':
        return 'text-green-600';
      case 'processing':
      case 'encoding':
        return 'text-blue-600';
      case 'error':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };
  
  const refreshVideos = () => {
    fetchVideos();
  };
  
  onMounted(() => {
    fetchVideos();
  });
  
  // Expondo métodos para serem acessíveis externamente
  defineExpose({
    refreshVideos,
    updateOrAddVideo
  });
  </script>