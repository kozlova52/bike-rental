import { Test, TestingModule } from '@nestjs/testing';
import { BicyclesController } from './bicycles.controller';
import { BicyclesService } from './bicycles.service';

describe('BicyclesController', () => {
  let controller: BicyclesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BicyclesController],
      providers: [BicyclesService],
    }).compile();

    controller = module.get<BicyclesController>(BicyclesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
