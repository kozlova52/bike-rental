import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BicyclesService } from './bicycles.service';
import { BicyclesController } from './bicycles.controller';
import { Bicycle } from './entities/bicycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bicycle])],
  controllers: [BicyclesController],
  providers: [BicyclesService],
})
export class BicyclesModule {}
