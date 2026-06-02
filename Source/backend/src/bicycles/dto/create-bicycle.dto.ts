import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateBicycleDto {
  @IsNotEmpty()
  @IsString()
  model!: string;

  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsNumber()
  pricePerHour!: number;

  @IsString()
  status!: string;
}