import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { BicyclesModule } from './bicycles/bicycles.module';
import { UsersModule } from './users/users.module';
import { RentalPointsModule } from './rental-points/rental-points.module';
import { RentalsModule } from './rentals/rentals.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'vika2006',
      database: 'bike_rental',
      autoLoadEntities: true,
      synchronize: false ,
    }),

    BicyclesModule,
    UsersModule,
    RentalPointsModule,
    RentalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
