import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateRentalPointDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNumber()
  capacity!: number;
}