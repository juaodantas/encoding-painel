import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { VideoService } from '../services/video.service';
import { FastifyInstance } from 'fastify';

let io: Server;
let videoService: VideoService;

interface VideoUploadCompleteData {
  videoId: string;
  etag: string;
  status: string;
}

interface VideoUploadErrorData {
  videoId: string;
  error: string;
}

export const initializeSocket = (server: HTTPServer, fastify: FastifyInstance) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Inicializa o VideoService com a instância do Fastify
  videoService = new VideoService(fastify);

  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('video:upload-complete', async (data: VideoUploadCompleteData, callback) => {
      // Confirmar recebimento imediatamente
      if (typeof callback === 'function') {
        callback({ received: true });
      }
      
      try {
        console.log('Recebendo evento de upload completo:', data);
        const processedVideo = await videoService.handleUploadComplete(data.videoId, data.etag);
        
        // Use o status retornado pelo processedVideo em vez do data.status enviado
        io.emit('video:status-updated', {
          videoId: data.videoId,
          status: processedVideo.status,
          etag: data.etag,
          fileName: processedVideo.fileName,
          updatedAt: processedVideo.updatedAt
        });
      } catch (error) {
        console.error('Erro ao processar upload completo:', error);
        socket.emit('video:upload-error', {
          videoId: data.videoId,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    });
  
    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO não foi inicializado');
  }
  return io;
}; 

// Adicione um método para o VideoService notificar sobre atualizações de status
export const emitVideoStatusUpdate = (videoData: { videoId: string, status: string, [key: string]: any }) => {
  if (io) {
    console.log('Emitindo atualização de status para todos os clientes:', videoData);
    io.emit('video:status-updated', videoData);
  } else {
    console.error('Socket.IO não inicializado, não é possível emitir evento');
  }
};