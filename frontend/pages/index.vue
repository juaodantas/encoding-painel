<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">
          Bem vindo {{ authStore.user?.nome }}, ao Painel de Encoding de vídeos
        </h1>
        <button @click="handleLogout" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-2xl font-semibold text-gray-900 mb-6">Upload de Vídeo</h2>
          <VideoUploadButton 
            ref="videoUploadRef"
            @file-selected="handleVideoUpload" 
            @file-removed="handleVideoRemoved"
            @submit="handleVideoSubmit" 
          />
        </div>
      </div>

      <!-- Status do Upload -->
      <div v-if="uploadStatus" class="mt-4">
        <div class="text-sm text-gray-600">{{ uploadStatus }}</div>
        <div v-if="uploadProgress > 0" class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
      </div>

      <!-- Mensagem de Erro -->
      <div v-if="uploadError" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ uploadError }}
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import VideoUploadButton from '~/components/VideoUploadButton.vue';
import { api } from '~/services/api'
import { s3 } from '~/services/s3'
import { socketService } from '~/services/socket'

const authStore = useAuthStore();
const router = useRouter();
const videoUploadRef = ref<InstanceType<typeof VideoUploadButton> | null>(null);

// Computed property para verificar autenticação
const isAuthenticated = computed(() => !!authStore.token);

// Computed property para acessar os dados do usuário
const user = computed(() => authStore.user);

const uploadStatus = ref<string>('');
const uploadProgress = ref<number>(0);
const uploadError = ref<string | null>(null);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const handleVideoSubmit = async (file: File) => {
  console.log('Submitting video:', file.name);
  uploadStatus.value = 'Iniciando upload...';
  uploadProgress.value = 0;
  uploadError.value = null;

  try {
    // Gera URL de upload
    uploadStatus.value = 'Gerando URL de upload...';
    const generateUploadData = await api.generateUpload(file, authStore.user?.id);
    
    // Faz o upload do arquivo
    uploadStatus.value = 'Enviando arquivo para o S3...';
    const uploadResult = await s3.uploadFile(generateUploadData?.uploadUrl, file);
    
    if (uploadResult.success) {
      uploadProgress.value = 50;
      uploadStatus.value = 'Upload concluído. Atualizando status...';
      
      // Emite evento via WebSocket
      await socketService.emitVideoUploadComplete({
        videoId: generateUploadData.videoId,
        etag: uploadResult.etag,
        status: 'uploaded'
      });
      
      uploadStatus.value = 'Vídeo enviado com sucesso!';
      uploadProgress.value = 100;
      
      // Reseta o estado após 2 segundos
      setTimeout(() => {
        uploadStatus.value = '';
        uploadProgress.value = 0;
        videoUploadRef.value?.resetState();
      }, 2000);
    } else {
      uploadError.value = 'Falha na verificação do upload';
      // Emite evento de erro via WebSocket
      await socketService.emitVideoUploadError({
        videoId: generateUploadData.videoId,
        error: 'Upload verification failed'
      });
      throw new Error('Upload verification failed');
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    uploadError.value = error instanceof Error ? error.message : 'Erro desconhecido';
    uploadProgress.value = 0;
    
    // Emite evento de erro via WebSocket se tiver o videoId
    if (error instanceof Error && 'videoId' in error) {
      await socketService.emitVideoUploadError({
        videoId: (error as any).videoId,
        error: error.message
      });
    }

    // Reseta o estado após 2 segundos em caso de erro
    setTimeout(() => {
      uploadStatus.value = '';
      uploadProgress.value = 0;
      uploadError.value = null;
      videoUploadRef.value?.resetState();
    }, 2000);
  }
};

// Guard to redirect to login if token is not present
watch(() => authStore.token, (newToken) => {
  if (!newToken) {
    router.push('/login');
  }
}, { immediate: true });

// Inicializa o Socket.IO quando o componente é montado
onMounted(() => {
  if (authStore.token) {
    console.log('Initializing Socket.IO connection...');
    socketService.connect();
    
    // Callback para atualizações de status
    socketService.onVideoStatusUpdate((status) => {
      uploadStatus.value = `Status do vídeo: ${status.status}`;
      if (status.status === 'uploaded') {
        uploadProgress.value = 100;
      }
    });

    // Callback para erros
    socketService.onVideoError((error) => {
      uploadError.value = `Erro no upload: ${error.error}`;
      uploadProgress.value = 0;
    });
  } else {
    console.log('No token available, skipping Socket.IO initialization');
  }
});

// Desconecta o Socket.IO quando o componente é desmontado
onUnmounted(() => {
  console.log('Disconnecting Socket.IO...');
  socketService.disconnect();
});
</script> 