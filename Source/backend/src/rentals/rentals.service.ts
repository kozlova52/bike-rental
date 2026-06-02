import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Rental } from './entities/rental.entity';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { Bicycle } from '../bicycles/entities/bicycle.entity';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(Rental)
    private rentalsRepository: Repository<Rental>,
    @InjectRepository(Bicycle)
    private bicyclesRepository: Repository<Bicycle>,
    private dataSource: DataSource,
  ) {}

  async create(createRentalDto: CreateRentalDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bicycle = await queryRunner.manager.findOne(Bicycle, {
        where: { id: createRentalDto.bicycleId },
      });

      if (!bicycle) {
        throw new BadRequestException('Велосипед не найден');
      }

      if (bicycle.status !== 'available') {
        throw new BadRequestException('Велосипед уже арендован');
      }

      await queryRunner.manager.update(Bicycle, createRentalDto.bicycleId, {
        status: 'rented',
      });

      const rental = queryRunner.manager.create(Rental, createRentalDto);
      const savedRental = await queryRunner.manager.save(rental);

      await queryRunner.commitTransaction();
      return savedRental;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateRentalDto: UpdateRentalDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rental = await queryRunner.manager.findOne(Rental, {
        where: { id },
      });

      if (updateRentalDto.status === 'completed' && rental?.status === 'active') {
        await queryRunner.manager.update(Bicycle, rental.bicycleId, {
          status: 'available',
        });
      }

      await queryRunner.manager.update(Rental, id, updateRentalDto);
      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.rentalsRepository.find();
  }

  findOne(id: number) {
    return this.rentalsRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number) {
  // Сначала находим аренду
  const rental = await this.rentalsRepository.findOne({
    where: { id },
  });
  
  if (rental && rental.status === 'active') {
    // Возвращаем велосипед в доступные
    await this.bicyclesRepository.update(rental.bicycleId, {
      status: 'available',
    });
  }
  
  // Удаляем аренду
  return this.rentalsRepository.delete(id);
  }}