import { FastifyInstance } from 'fastify';
import { VideoController } from '../controllers/video.controller';
import { generateUploadUrlSchema } from '../dtos/video/generate-upload-url.dto';
import { getVideoByIdSchema } from '../dtos/video/get-video.dto';

export default async function videoRoutes(fastify: FastifyInstance) {
  const videoController = new VideoController(fastify);

  // Generate upload URL
  fastify.post('/videos/upload-url', {
    schema: {
      ...generateUploadUrlSchema,
      tags: ['videos'],
      summary: 'Gerar URL de upload para vídeo',
      security: [{ bearerAuth: [] }]
    }
  }, videoController.generateUploadUrl.bind(videoController));

  // Get video by ID
  fastify.get('/videos/:id', {
    schema: {
      ...getVideoByIdSchema,
      tags: ['videos'],
      summary: 'Buscar vídeo por ID',
      security: [{ bearerAuth: [] }]
    }
  }, videoController.getVideoById.bind(videoController));
}