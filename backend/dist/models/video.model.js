"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = exports.VideoModel = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = require("./user.model");
class VideoModel extends sequelize_1.Model {
}
exports.VideoModel = VideoModel;
exports.Video = database_1.sequelize.define('Video', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    titulo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'uploaded', 'processing', 'done', 'error'),
        allowNull: false,
        defaultValue: 'pending'
    },
    originalUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    processedUrl_720p: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    processedUrl_480p: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    dataUpload: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    usuarioCriadorId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
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
    tableName: 'videos',
    timestamps: true,
    underscored: true,
});
// Relacionamento com User
exports.Video.belongsTo(user_model_1.User, { foreignKey: 'usuarioCriadorId', as: 'criador' });
user_model_1.User.hasMany(exports.Video, { foreignKey: 'usuarioCriadorId', as: 'videos' });
