"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = videoRoutes;
const video_controller_1 = require("../controllers/video.controller");
const generate_upload_url_dto_1 = require("../dtos/video/generate-upload-url.dto");
const get_video_dto_1 = require("../dtos/video/get-video.dto");
async function videoRoutes(fastify) {
    const videoController = new video_controller_1.VideoController(fastify);
    // Generate upload URL
    fastify.post('/videos/upload-url', {
        schema: {
            ...generate_upload_url_dto_1.generateUploadUrlSchema,
            tags: ['videos'],
            summary: 'Gerar URL de upload para vídeo',
            security: [{ bearerAuth: [] }]
        }
    }, videoController.generateUploadUrl.bind(videoController));
    // Get video by ID
    fastify.get('/videos/:id', {
        schema: {
            ...get_video_dto_1.getVideoByIdSchema,
            tags: ['videos'],
            summary: 'Buscar vídeo por ID',
            security: [{ bearerAuth: [] }]
        }
    }, videoController.getVideoById.bind(videoController));
    fastify.get('/videos', {
        schema: {
            tags: ['videos'],
            summary: 'Buscar todos os vídeos',
            security: [{ bearerAuth: [] }]
        }
    }, videoController.getAllVideos.bind(videoController));
}
