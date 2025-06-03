"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKafkaProducer = exports.KafkaProducer = void 0;
class KafkaProducer {
    constructor(fastify) {
        this.fastify = fastify;
        this.producer = fastify.kafka.producer;
    }
    /**
     * Envia uma mensagem para um tópico Kafka
     * @param topic - Nome do tópico
     * @param message - Mensagem a ser enviada
     * @returns Promise<void>
     */
    async sendMessage(topic, message) {
        try {
            await this.producer.send({
                topic,
                messages: [{ value: JSON.stringify(message) }],
            });
            console.log(`Message sent to topic ${topic} successfully`);
        }
        catch (error) {
            console.error(`Error sending message to topic ${topic}:`, error);
            throw error;
        }
    }
    /**
     * Envia múltiplas mensagens para um tópico Kafka
     * @param topic - Nome do tópico
     * @param messages - Array de mensagens a serem enviadas
     * @returns Promise<void>
     */
    async sendBatchMessages(topic, messages) {
        try {
            await this.producer.send({
                topic,
                messages: messages.map(message => ({
                    value: JSON.stringify(message)
                })),
            });
            console.log(`Batch messages sent to topic ${topic} successfully`);
        }
        catch (error) {
            console.error(`Error sending batch messages to topic ${topic}:`, error);
            throw error;
        }
    }
}
exports.KafkaProducer = KafkaProducer;
// Factory function para criar uma instância do producer
const createKafkaProducer = (fastify) => {
    return new KafkaProducer(fastify);
};
exports.createKafkaProducer = createKafkaProducer;
