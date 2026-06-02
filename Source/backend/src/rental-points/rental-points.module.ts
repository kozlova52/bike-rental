import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RentalPointsService } from './rental-points.service';
import { RentalPointsController } from './rental-points.controller';
import { RentalPoint } from './entities/rental-point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RentalPoint])],
  controllers: [RentalPointsController],
  providers: [RentalPointsService],
})
export class RentalPointsModule {}
