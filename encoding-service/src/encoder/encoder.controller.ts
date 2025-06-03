import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { KafkaTopics } from 'src/kafka/config/topics';
import { EncoderService } from './encoder.service';

@Controller('encoder')
export class EncoderController {

    public constructor(private readonly encoderService: EncoderService) {}

    
    @MessagePattern(KafkaTopics.encoder_video, Transport.KAFKA)
    // OBS: Any mantido para evitar a tipagem Buffer para o value do KafkaMessage
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    public async encoder(@Payload() encodeVideo: any): Promise<void> {
      try {
        await this.encoderService.encoder(encodeVideo);
      } catch (error) {
        throw new Error(`Erro Criação Medidor : ${error}`);
      }
    }
}
