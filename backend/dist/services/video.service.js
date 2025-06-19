"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_config_1 = require("../config/s3.config");
const video_repository_1 = require("../repositories/video.repository");
const uuid_1 = require("uuid");
const socket_1 = require("../config/socket");
class VideoService {
    constructor(fastify) {
        this.fastify = fastify;
        this.videoRepository = new video_repository_1.VideoRepository();
    }
    /**
     * Gera uma URL de upload para um vídeo
     * @param fileName - Nome do arquivo
     * @param fileType - Tipo do arquivo
     * @param userId - ID do usuário
     * @returns Promise<UploadUrlResponse> - URL de upload e chave do arquivo
     * @throws {Error} - Erro caso a operação falhe
     */
    async generateUploadUrl(fileName, fileType, userId) {
        try {
            const videoId = (0, uuid_1.v4)();
            const key = `${userId}/${videoId}/${fileName}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: s3_config_1.S3_BUCKET,
                Key: key,
                ContentType: fileType,
            });
            const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_config_1.s3Client, command, { expiresIn: 60 * 5 });
            console.log('Signed URL:', signedUrl);
            // Create video record in database
            const videoData = {
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
                videoId: videoId,
                fileName: fileName,
                uploadUrl: signedUrl,
                key: videoId
            };
        }
        catch (error) {
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
    async handleUploadComplete(videoId, etag) {
        console.log(`[handleUploadComplete] Iniciando para videoId: ${videoId}, etag: ${etag}`);
        //const kafkaProducer = createKafkaProducer(this.fastify);
        try {
            const video = await this.videoRepository.findById(videoId);
            console.log(`[handleUploadComplete] Vídeo encontrado:`, video ? `ID: ${video.id}, Status: ${video.status}` : 'Não encontrado');
            if (!video) {
                throw new Error('Vídeo não encontrado');
            }
            console.log(`[handleUploadComplete] Atualizando vídeo para status 'uploaded'`);
            const [updatedCount, updatedVideos] = await this.videoRepository.update(videoId, {
                status: 'uploaded',
                metadata: { ...video.metadata, etag }
            });
            console.log(`[handleUploadComplete] Resultado da atualização: count=${updatedCount}, videos=`, updatedVideos);
            if (updatedCount === 0) {
                throw new Error('Falha ao atualizar status do vídeo');
            }
            const updatedVideo = updatedVideos[0];
            const url = `https://raw-videos-poc.s3.us-east-1.amazonaws.com/${updatedVideo.originalUrl}`;
            // Emite evento de atualização
            const io = (0, socket_1.getIO)();
            console.log(`[handleUploadComplete] Emitindo evento 'video:status-updated' com status 'uploaded'`);
            io.emit('video:status-updated', {
                videoId,
                status: 'uploaded',
                etag
            });
            // Envia mensagem para o Kafka
            console.log(`[handleUploadComplete] Enviando mensagem para Kafka`);
            console.log(`[handleUploadComplete] Processo concluído com sucesso`);
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
        catch (error) {
            console.error(`[handleUploadComplete] Erro:`, error);
            throw error;
        }
    }
    /**
     * Obtém um vídeo pelo ID
     * @param id - ID do vídeo
     * @returns Promise<VideoResponse> - Dados do vídeo
     * @throws {Error} - Erro caso a operação falhe
     */
    async getVideoById(id) {
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
     * Obtém todos os vídeos
     * @returns Promise<VideoResponse[]> - Lista de vídeos
     * @throws {Error} - Erro caso a operação falhe
     */
    async getAllVideos() {
        const videos = await this.videoRepository.findAll();
        return videos.map(video => ({
            id: video.id,
            fileName: video.titulo,
            fileType: video.metadata?.fileType || '',
            userId: video.usuarioCriadorId,
            url: video.originalUrl,
            status: video.status,
            createdAt: video.created_at,
            updatedAt: video.updated_at
        }));
    }
    /**
     * Atualiza o status de um vídeo
     * @param id - ID do vídeo
     * @param status - Novo status do vídeo
     * @param processedUrls - URLs dos vídeos processados
     * @returns Promise<VideoResponse> - Dados do vídeo atualizado
     * @throws {Error} - Erro caso a operação falhe
     */
    async updateVideoStatus(id, status, processedUrls) {
        const updateData = {
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
        const io = (0, socket_1.getIO)();
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
exports.VideoService = VideoService;
