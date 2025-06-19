"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRepository = void 0;
const socket_1 = require("../config/socket");
const video_model_1 = require("../models/video.model");
class VideoRepository {
    async create(videoData) {
        (0, socket_1.emitVideoStatusUpdate)({
            videoId: videoData.id ?? '',
            status: 'pending',
        });
        return await video_model_1.Video.create(videoData);
    }
    async findById(id) {
        return await video_model_1.Video.findByPk(id);
    }
    async findAll() {
        return await video_model_1.Video.findAll();
    }
    async update(id, videoData) {
        return await video_model_1.Video.update(videoData, {
            where: { id },
            returning: true,
        });
    }
}
exports.VideoRepository = VideoRepository;
