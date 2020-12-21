import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';

@Module({
  providers: [HashtagService],
  controllers: [HashtagController]
})
export class HashtagModule {}
