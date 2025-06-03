"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
const video_service_1 = require("../services/video.service");
class VideoController {
    constructor(fastify) {
        this.fastify = fastify;
        this.videoService = new video_service_1.VideoService(fastify);
    }
    /**
     * Gera uma URL de upload para um vídeo
     * @param request - Requisição contendo dados do arquivo e usuário
     * @param reply - Resposta do Fastify
     * @returns Promise<UploadUrlResponse> - URL de upload e chave do arquivo
     * @throws {VideoError} - Erro caso a operação falhe
     */
    async generateUploadUrl(request, reply) {
        try {
            const { fileName, fileType, userId } = request.body;
            if (!userId) {
                const videoError = {
                    message: 'Usuário não autenticado',
                    code: 'UNAUTHORIZED'
                };
                reply.status(401).send(videoError);
                throw videoError;
            }
            if (!fileName || !fileType) {
                const videoError = {
                    message: 'Nome do arquivo e tipo são obrigatórios',
                    code: 'INVALID_DATA'
                };
                reply.status(400).send(videoError);
                throw videoError;
            }
            const result = await this.videoService.generateUploadUrl(fileName, fileType, userId);
            console.log('Result:==============', result);
            reply.send(result);
            return result;
        }
        catch (error) {
            const videoError = {
                message: error.message || 'Erro ao gerar URL de upload',
                code: error.message?.includes('AWS S3') ? 'SERVER_ERROR' : 'INVALID_DATA'
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
    async getVideoById(request, reply) {
        try {
            const { id } = request.params;
            const video = await this.videoService.getVideoById(id);
            if (!video) {
                const videoError = {
                    message: 'Vídeo não encontrado',
                    code: 'VIDEO_NOT_FOUND'
                };
                reply.status(404).send(videoError);
                throw videoError;
            }
            reply.send(video);
            return video;
        }
        catch (error) {
            const videoError = {
                message: error.message || 'Erro ao buscar vídeo',
                code: 'SERVER_ERROR'
            };
            reply.status(500).send(videoError);
            throw videoError;
        }
    }
}
exports.VideoController = VideoController;
