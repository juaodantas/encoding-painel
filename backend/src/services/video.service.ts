import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '../config/s3.config';
import { VideoRepository } from '../repositories/video.repository';
import { VideoCreationAttributes } from '../models/video.model';
import { v4 as uuidv4 } from 'uuid';
import { getIO } from '../config/socket';
import { FastifyInstance } from 'fastify';
import { createKafkaProducer } from '../plugins/kafkaProducer';
import { UploadUrlResponse, VideoResponse } from '../types/video.types';

export class VideoService {
  private videoRepository: VideoRepository;

  constructor(private readonly fastify: FastifyInstance) {
    this.videoRepository = new VideoRepository();
  }

  /**
   * Gera uma URL de upload para um vídeo
   * @param fileName - Nome do arquivo
   * @param fileType - Tipo do arquivo
   * @param userId - ID do usuário
   * @returns Promise<UploadUrlResponse> - URL de upload e chave do arquivo
   * @throws {Error} - Erro caso a operação falhe
   */
  async generateUploadUrl(
    fileName: string, 
    fileType: string, 
    userId: string
  ): Promise<UploadUrlResponse> {
    try {
      const videoId = uuidv4();
      const key = `${userId}/${videoId}/${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: fileType,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 });
      console.log('Signed URL:', signedUrl);
      // Create video record in database
      const videoData: VideoCreationAttributes = {
        id: videoId,
        titulo: fileName,
        descricao: 'Video em processamento',
        status: 'pending',
        originalUrl: key,
        usuarioCriadorId: userId,
        dataUpload: new Date(),
        metadata: { fileType }
      };

      await this.videoRepository.create(videoData);

      return {
        uploadUrl: signedUrl,
        key: videoId
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          throw new Error('Erro de autenticação com AWS S3. Verifique as credenciais.');
        }
        if (error.message.includes('bucket')) {
          throw new Error('Erro ao acessar o bucket S3. Verifique se o bucket existe e está acessível.');
        }
      }
      
      throw new Error('Erro ao gerar URL de upload. Por favor, tente novamente.');
    }
  }

  /**
   * Processa o upload completo de um vídeo
   * @param videoId - ID do vídeo
   * @param etag - ETag do arquivo no S3
   * @returns Promise<VideoResponse> - Dados do vídeo atualizado
   * @throws {Error} - Erro caso a operação falhe
   */
  async handleUploadComplete(
    videoId: string, 
    etag: string
  ): Promise<VideoResponse> {
    const kafkaProducer = createKafkaProducer(this.fastify);

    try {
      const video = await this.videoRepository.findById(videoId);
      if (!video) {
        throw new Error('Vídeo não encontrado');
      }

      const [updatedCount, updatedVideos] = await this.videoRepository.update(videoId, {
        status: 'uploaded',
        metadata: { etag }
      });

      if (updatedCount === 0) {
        throw new Error('Falha ao atualizar status do vídeo');
      }

      const updatedVideo = updatedVideos[0];
      const url = `https://raw-videos-poc.s3.us-east-1.amazonaws.com/${updatedVideo.originalUrl}`;

      // Emite evento de atualização
      const io = getIO();
      io.emit('video:status-updated', {
        videoId,
        status: 'uploaded',
        etag
      });

      // Envia mensagem para o Kafka
      await kafkaProducer.sendMessage('encoder-video', {
        url,
        videoId,
        status: 'uploaded',
        etag,
        timestamp: new Date().toISOString()
      });

      return {
        id: updatedVideo.id,
        fileName: updatedVideo.titulo,
        fileType: updatedVideo.metadata?.fileType || '',
        userId: updatedVideo.usuarioCriadorId,
        url: updatedVideo.originalUrl,
        status: updatedVideo.status,
        createdAt: updatedVideo.created_at,
        updatedAt: updatedVideo.updated_at
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtém um vídeo pelo ID
   * @param id - ID do vídeo
   * @returns Promise<VideoResponse> - Dados do vídeo
   * @throws {Error} - Erro caso a operação falhe
   */
  async getVideoById(id: string): Promise<VideoResponse> {
    const video = await this.videoRepository.findById(id);
    if (!video) {
      throw new Error('Vídeo não encontrado');
    }

    return {
      id: video.id,
      fileName: video.titulo,
      fileType: video.metadata?.fileType || '',
      userId: video.usuarioCriadorId,
      url: video.originalUrl,
      status: video.status,
      createdAt: video.created_at,
      updatedAt: video.updated_at
    };
  }

  /**
   * Atualiza o status de um vídeo
   * @param id - ID do vídeo
   * @param status - Novo status do vídeo
   * @param processedUrls - URLs dos vídeos processados
   * @returns Promise<VideoResponse> - Dados do vídeo atualizado
   * @throws {Error} - Erro caso a operação falhe
   */
  async updateVideoStatus(
    id: string, 
    status: 'pending' | 'uploaded' | 'processing' | 'done' | 'error', 
    processedUrls?: { url_720p?: string; url_480p?: string }
  ): Promise<VideoResponse> {
    const updateData: Partial<VideoCreationAttributes> = {
      status,
      ...(processedUrls?.url_720p && { processedUrl_720p: processedUrls.url_720p }),
      ...(processedUrls?.url_480p && { processedUrl_480p: processedUrls.url_480p }),
    };

    const [updatedCount, updatedVideos] = await this.videoRepository.update(id, updateData);
    
    if (updatedCount === 0) {
      throw new Error('Falha ao atualizar status do vídeo');
    }

    const updatedVideo = updatedVideos[0];
    
    // Emite evento de atualização
    const io = getIO();
    io.emit('video:status-updated', {
      videoId: id,
      status,
      ...(processedUrls && { processedUrls })
    });

    return {
      id: updatedVideo.id,
      fileName: updatedVideo.titulo,
      fileType: updatedVideo.metadata?.fileType || '',
      userId: updatedVideo.usuarioCriadorId,
      url: updatedVideo.originalUrl,
      status: updatedVideo.status,
      createdAt: updatedVideo.created_at,
      updatedAt: updatedVideo.updated_at
    };
  }
} 