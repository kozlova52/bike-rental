import { Test, TestingModule } from '@nestjs/testing';
import { RentalPointsController } from './rental-points.controller';
import { RentalPointsService } from './rental-points.service';

describe('RentalPointsController', () => {
  let controller: RentalPointsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalPointsController],
      providers: [RentalPointsService],
    }).compile();

    controller = module.get<RentalPointsController>(RentalPointsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
