import { Module, OnModuleInit } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_BROKER, KafkaTopics } from './config/topics';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'encoding-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'encoding-service-group',
          },
          run: {
            autoCommit: true,
          },
        },
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [ClientsModule, KafkaService],
})
export class KafkaModule implements OnModuleInit {
  /**
   * Construtor para KafkaModule
   * @param {KafkaService} kafkaService instancia para KafkaService
   */
  public constructor(private readonly kafkaService: KafkaService) {}

  /**
   * Criação de todos os topicos kafka
   * @returns {Promise<void>} - Promise que é resolvida quando a operação é concluída.
   */
  public async onModuleInit(): Promise<void> {
    const topicsToCreate: string[] = [
      KafkaTopics.encoder_status,
      KafkaTopics.encoder_video
    ];

    try {
      console.log('Iniciando criação dos tópicos Kafka:', topicsToCreate);
      console.log('Broker configurado:', 'localhost:9092');
      await this.kafkaService.createTopics(topicsToCreate);
      console.log('Tópicos criados com sucesso');
    } catch (error) {
      console.error('Erro ao criar tópicos:', error);
      throw error; 
    }
  }
}
