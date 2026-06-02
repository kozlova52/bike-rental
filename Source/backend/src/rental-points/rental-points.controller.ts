import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RentalPointsService } from './rental-points.service';
import { CreateRentalPointDto } from './dto/create-rental-point.dto';
import { UpdateRentalPointDto } from './dto/update-rental-point.dto';

@Controller('rental-points')
export class RentalPointsController {
  constructor(private readonly rentalPointsService: RentalPointsService) {}

  @Post()
  create(@Body() createRentalPointDto: CreateRentalPointDto) {
    return this.rentalPointsService.create(createRentalPointDto);
  }

  @Get()
  findAll() {
    return this.rentalPointsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalPointsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRentalPointDto: UpdateRentalPointDto) {
    return this.rentalPointsService.update(+id, updateRentalPointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentalPointsService.remove(+id);
  }
}
