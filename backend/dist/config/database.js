"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const dotenv_1 = require("dotenv");
const sequelize_1 = require("sequelize");
// Load environment variables
(0, dotenv_1.config)();
const env = process.env.NODE_ENV || 'development';
const configs = {
    development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'movie_recommender',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        dialectOptions: {
            ssl: false
        }
    },
    test: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME_TEST || 'movie_recommender_test',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        dialectOptions: {
            ssl: false
        }
    },
    production: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'movie_recommender',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        dialectOptions: {
            ssl: false
        }
    }
};
const dbConfig = configs[env];
// Export for Sequelize CLI
exports.default = dbConfig;
// Export for application use
exports.sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: false,
    define: {
        timestamps: true,
        underscored: true,
    },
});
