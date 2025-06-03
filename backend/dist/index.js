"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const fastify_1 = require("fastify");
const database_1 = require("./config/database");
const swagger_1 = require("./config/swagger");
const socket_1 = require("./config/socket");
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const kafka_1 = __importDefault(require("./config/kafka"));
// Load environment variables
(0, dotenv_1.config)();
const PORT = parseInt(process.env.PORT || '3001', 10);
// Create Fastify instance
const app = (0, fastify_1.fastify)({
    logger: true
});
async function startServer() {
    try {
        // Inicializa a conexão com o banco de dados
        await database_1.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        // Register plugins
        await app.register(cors_1.default, {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true
        });
        await app.register(jwt_1.default, {
            secret: process.env.JWT_SECRET || 'your-secret-key'
        });
        // Register Kafka plugin
        await app.register(kafka_1.default);
        console.log('Kafka plugin registered successfully');
        // Register routes
        await app.register(Promise.resolve().then(() => __importStar(require('./routes/auth.routes'))));
        await app.register(Promise.resolve().then(() => __importStar(require('./routes/video.routes'))));
        await app.register(Promise.resolve().then(() => __importStar(require('./routes/user.routes'))));
        // Setup Swagger
        (0, swagger_1.setupSwagger)(app);
        // Inicializa o Socket.IO usando o servidor HTTP do Fastify
        const io = (0, socket_1.initializeSocket)(app.server, app);
        console.log('Socket.IO has been initialized successfully.');
        // Inicia o servidor HTTP com Fastify
        await app.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running on port ${PORT}`);
    }
    catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}
startServer();
