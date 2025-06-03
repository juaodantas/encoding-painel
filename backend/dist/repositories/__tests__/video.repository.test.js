"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const video_repository_1 = require("../video.repository");
const video_model_1 = require("../../models/video.model");
// Mock do modelo Video
jest.mock('../../models/video.model', () => ({
    Video: {
        create: jest.fn(),
        findByPk: jest.fn(),
        update: jest.fn(),
    }
}));
describe('VideoRepository', () => {
    let videoRepository;
    let mockVideo;
    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste
        jest.clearAllMocks();
        // Configura o mock do vídeo
        mockVideo = {
            id: '1',
            titulo: 'Test Video',
            descricao: 'Test Description',
            originalUrl: 'https://example.com/video.mp4',
            status: 'pending',
            usuarioCriadorId: '1',
            metadata: {
                fileType: 'video/mp4',
                duration: 120
            }
        };
        videoRepository = new video_repository_1.VideoRepository();
    });
    describe('create', () => {
        it('should create a new video', async () => {
            // Arrange
            const videoData = {
                titulo: 'New Video',
                descricao: 'New Description',
                originalUrl: 'https://example.com/new-video.mp4',
                status: 'pending',
                usuarioCriadorId: '1',
                metadata: {
                    fileType: 'video/mp4',
                    duration: 180
                }
            };
            video_model_1.Video.create.mockResolvedValue({
                id: '2',
                ...videoData
            });
            // Act
            const result = await videoRepository.create(videoData);
            // Assert
            expect(result).toEqual({
                id: '2',
                ...videoData
            });
            expect(video_model_1.Video.create).toHaveBeenCalledWith(videoData);
        });
    });
    describe('findById', () => {
        it('should return video when found', async () => {
            // Arrange
            video_model_1.Video.findByPk.mockResolvedValue(mockVideo);
            // Act
            const result = await videoRepository.findById('1');
            // Assert
            expect(result).toEqual(mockVideo);
            expect(video_model_1.Video.findByPk).toHaveBeenCalledWith('1');
        });
        it('should return null when video is not found', async () => {
            // Arrange
            video_model_1.Video.findByPk.mockResolvedValue(null);
            // Act
            const result = await videoRepository.findById('1');
            // Assert
            expect(result).toBeNull();
            expect(video_model_1.Video.findByPk).toHaveBeenCalledWith('1');
        });
    });
    describe('update', () => {
        it('should update video successfully', async () => {
            // Arrange
            const updateData = {
                status: 'processing',
                metadata: {
                    duration: 150
                }
            };
            const updatedVideo = {
                ...mockVideo,
                ...updateData
            };
            video_model_1.Video.update.mockResolvedValue([1, [updatedVideo]]);
            // Act
            const result = await videoRepository.update('1', updateData);
            // Assert
            expect(result).toEqual([1, [updatedVideo]]);
            expect(video_model_1.Video.update).toHaveBeenCalledWith(updateData, {
                where: { id: '1' },
                returning: true
            });
        });
        it('should return [0, []] when no video is updated', async () => {
            // Arrange
            const updateData = {
                status: 'processing'
            };
            video_model_1.Video.update.mockResolvedValue([0, []]);
            // Act
            const result = await videoRepository.update('1', updateData);
            // Assert
            expect(result).toEqual([0, []]);
            expect(video_model_1.Video.update).toHaveBeenCalledWith(updateData, {
                where: { id: '1' },
                returning: true
            });
        });
    });
});
