import { Module } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import { FacebookController } from './facebook.controller';

@Module({
  controllers: [FacebookController],
  providers: [FacebookService],
  exports: [FacebookService], 
  
})
export class FacebookModule {}
