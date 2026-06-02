import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateRentalDto {
  @IsNumber()
  userId!: number;

  @IsNumber()
  bicycleId!: number;

  @IsNumber()
  pointId!: number;

  @IsNumber()
  hours!: number;

  @IsNotEmpty()
  @IsString()
  startDate!: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsNumber()
  totalPrice!: number;

  @IsOptional()
  @IsString()
  status?: string;
}