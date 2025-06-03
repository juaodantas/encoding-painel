"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRepository = void 0;
const video_model_1 = require("../models/video.model");
class VideoRepository {
    async create(videoData) {
        return await video_model_1.Video.create(videoData);
    }
    async findById(id) {
        return await video_model_1.Video.findByPk(id);
    }
    async update(id, videoData) {
        return await video_model_1.Video.update(videoData, {
            where: { id },
            returning: true,
        });
    }
}
exports.VideoRepository = VideoRepository;
