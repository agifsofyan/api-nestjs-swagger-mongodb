import { Module } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GamificationSchema } from './schemas/gamification.schema';

@Module({
  imports: [
		MongooseModule.forFeature([
      { name: 'Gamification', schema: GamificationSchema }
    ])
	],
  providers: [GamificationService],
  controllers: [GamificationController],
  exports: [MongooseModule, GamificationService]
})
export class GamificationModule {}
