import { Module } from '@nestjs/common';
import { EncoderService } from './encoder.service';
import { EncoderController } from './encoder.controller';

@Module({
  providers: [EncoderService],
  controllers: [EncoderController]
})
export class EncoderModule {}
