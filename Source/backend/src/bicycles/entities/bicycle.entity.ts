import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { RentalPoint } from '../../rental-points/entities/rental-point.entity';
import { Rental } from '../../rentals/entities/rental.entity';

@Entity('bicycles')
export class Bicycle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  model!: string;

  @Column()
  type!: string;

  @Column('decimal')
  pricePerHour!: number;

  @Column({ default: 'available' })
  status!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @OneToMany(() => Bicycle, (bicycle) => bicycle.rentalPointId)
bicycles!: Bicycle[];
  @Column({ nullable: true })
  rentalPointId!: number;

  @OneToMany(() => Rental, (rental) => rental.bicycle)
  rentals!: Rental[];
}