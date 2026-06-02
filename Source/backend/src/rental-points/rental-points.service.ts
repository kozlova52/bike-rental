import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RentalPoint } from './entities/rental-point.entity';
import { CreateRentalPointDto } from './dto/create-rental-point.dto';
import { UpdateRentalPointDto } from './dto/update-rental-point.dto';

@Injectable()
export class RentalPointsService {
  constructor(
    @InjectRepository(RentalPoint)
    private rentalPointsRepository: Repository<RentalPoint>,
  ) {}

  create(createRentalPointDto: CreateRentalPointDto) {
    const rentalPoint = this.rentalPointsRepository.create(createRentalPointDto);
    return this.rentalPointsRepository.save(rentalPoint);
  }

  findAll() {
    return this.rentalPointsRepository.find();
  }

  findOne(id: number) {
    return this.rentalPointsRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateRentalPointDto: UpdateRentalPointDto) {
    await this.rentalPointsRepository.update(id, updateRentalPointDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.rentalPointsRepository.delete(id);
  }
}