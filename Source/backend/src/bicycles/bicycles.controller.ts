import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BicyclesService } from './bicycles.service';
import { CreateBicycleDto } from './dto/create-bicycle.dto';
import { UpdateBicycleDto } from './dto/update-bicycle.dto';

@Controller('bicycles')
export class BicyclesController {
  constructor(private readonly bicyclesService: BicyclesService) {}

  @Post()
  create(@Body() createBicycleDto: CreateBicycleDto) {
    return this.bicyclesService.create(createBicycleDto);
  }

  @Get()
  findAll() {
    return this.bicyclesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bicyclesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBicycleDto: UpdateBicycleDto) {
    return this.bicyclesService.update(+id, updateBicycleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bicyclesService.remove(+id);
  }
}
