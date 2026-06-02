import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Bicycle } from './entities/bicycle.entity';
import { CreateBicycleDto } from './dto/create-bicycle.dto';
import { UpdateBicycleDto } from './dto/update-bicycle.dto';

@Injectable()
export class BicyclesService {
  constructor(
    @InjectRepository(Bicycle)
    private bicyclesRepository: Repository<Bicycle>,
  ) {}

  create(createBicycleDto: CreateBicycleDto) {
    const bicycle = this.bicyclesRepository.create(createBicycleDto);
    return this.bicyclesRepository.save(bicycle);
  }

  findAll() {
    return this.bicyclesRepository.find();
  }

  findOne(id: number) {
    return this.bicyclesRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateBicycleDto: UpdateBicycleDto) {
    await this.bicyclesRepository.update(id, updateBicycleDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.bicyclesRepository.delete(id);
  }
}