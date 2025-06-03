"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const video_model_1 = require("./video.model");
class JobModel extends sequelize_1.Model {
}
exports.Job = database_1.sequelize.define('Job', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    videoId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'videos',
            key: 'id',
        },
    },
    tipo: {
        type: sequelize_1.DataTypes.ENUM('transcode'),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('queued', 'processing', 'done', 'error'),
        allowNull: false,
    },
    tentativas: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    dataCriacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    }
}, {
    tableName: 'jobs',
    timestamps: true,
    underscored: true,
});
// Relacionamento com Video
exports.Job.belongsTo(video_model_1.Video, { foreignKey: 'videoId', as: 'video' });
video_model_1.Video.hasMany(exports.Job, { foreignKey: 'videoId', as: 'jobs' });
