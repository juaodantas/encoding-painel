import { config as dotenvConfig } from 'dotenv';
import { Sequelize, Dialect } from 'sequelize';

// Load environment variables
dotenvConfig();

const env = process.env.NODE_ENV || 'development';

const configs = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'movie_recommender',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres' as Dialect,
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
    dialect: 'postgres' as Dialect,
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
    dialect: 'postgres' as Dialect,
    dialectOptions: {
      ssl: false
    }
  }
};

const dbConfig = configs[env as keyof typeof configs];

// Export for Sequelize CLI
export default dbConfig;

// Export for application use
export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
); 