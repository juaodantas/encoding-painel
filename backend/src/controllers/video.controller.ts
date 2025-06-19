import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { VideoService } from '../services/video.service';
import { 
  GenerateUploadUrlBody, 
  GetVideoByIdParams, 
  VideoResponse, 
  UploadUrlResponse, 
  VideoError 
} from '../types/video.types';



export class VideoController {
  private videoService: VideoService;

  constructor(private readonly fastify: FastifyInstance) {
    this.videoService = new VideoService(fastify);
  }

  /**
   * Gera uma URL de upload para um vídeo
   * @param request - Requisição contendo dados do arquivo e usuário
   * @param reply - Resposta do Fastify
   * @returns Promise<UploadUrlResponse> - URL de upload e chave do arquivo
   * @throws {VideoError} - Erro caso a operação falhe
   */
  async generateUploadUrl(
    request: FastifyRequest<{ Body: GenerateUploadUrlBody }>,
    reply: FastifyReply
  ): Promise<UploadUrlResponse> {
    try {
      const { fileName, fileType, userId } = request.body;

      if (!userId) {
        const videoError: VideoError = {
          message: 'Usuário não autenticado',
          code: 'UNAUTHORIZED'
        };
        reply.status(401).send(videoError);
        throw videoError;
      }

      if (!fileName || !fileType) {
        const videoError: VideoError = {
          message: 'Nome do arquivo e tipo são obrigatórios',
          code: 'INVALID_DATA'
        };
        reply.status(400).send(videoError);
        throw videoError;
      }

      const result = await this.videoService.generateUploadUrl(fileName, fileType, userId);
      reply.send(result);
      return result;
    } catch (error: any) {
      const videoError: VideoError = {
        message: error.message || 'Erro ao gerar URL de upload',
        code: error.message?.includes('AWS S3') ? 'SERVER_ERROR' : 'INVALID_DATA'
      };
      reply.status(500).send(videoError);
      throw videoError;
    }
  }

  async getAllVideos(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<VideoResponse[]> {
    try {
      const videos = await this.videoService.getAllVideos();
      reply.send(videos);
      return videos;
    } catch (error: any) {
      const videoError: VideoError = {
        message: error.message || 'Erro ao buscar vídeos',
        code: 'SERVER_ERROR'
      };
      reply.status(500).send(videoError);
      throw videoError;
    }
  }

  /**
   * Obtém um vídeo pelo ID
   * @param request - Requisição contendo ID do vídeo
   * @param reply - Resposta do Fastify
   * @returns Promise<VideoResponse> - Dados do vídeo
   * @throws {VideoError} - Erro caso a operação falhe
   */
  async getVideoById(
    request: FastifyRequest<{ Params: GetVideoByIdParams }>,
    reply: FastifyReply
  ): Promise<VideoResponse> {
    try {
      const { id } = request.params;
      const video = await this.videoService.getVideoById(id);

      if (!video) {
        const videoError: VideoError = {
          message: 'Vídeo não encontrado',
          code: 'VIDEO_NOT_FOUND'
        };
        reply.status(404).send(videoError);
        throw videoError;
      }

      reply.send(video);
      return video;
    } catch (error: any) {
      const videoError: VideoError = {
        message: error.message || 'Erro ao buscar vídeo',
        code: 'SERVER_ERROR'
      };
      reply.status(500).send(videoError);
      throw videoError;
    }
  }
} 