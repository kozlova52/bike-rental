import { PartialType } from '@nestjs/mapped-types';
import { CreateRentalPointDto } from './create-rental-point.dto';

export class UpdateRentalPointDto extends PartialType(CreateRentalPointDto) {}
