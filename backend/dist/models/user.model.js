"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserModel = void 0;
// /src/models/User.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class UserModel extends sequelize_1.Model {
}
exports.UserModel = UserModel;
exports.User = database_1.sequelize.define('User', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    nome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
});
