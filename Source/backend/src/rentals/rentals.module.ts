import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { Rental } from './entities/rental.entity';
import { Bicycle } from '../bicycles/entities/bicycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rental, Bicycle])],
  controllers: [RentalsController],
  providers: [RentalsService],
})
export class RentalsModule {}