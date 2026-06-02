import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bicycle } from '../../bicycles/entities/bicycle.entity';
import { Rental } from '../../rentals/entities/rental.entity';

@Entity('rental_points')
export class RentalPoint {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  workHours!: string;

  @Column({ nullable: true, default: 0 })
  availableBikes!: number;

  @Column({ nullable: true, type: 'decimal', default: 0 })
  rating!: number;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ nullable: true })
  image!: string;

  @Column()
  capacity!: number;

  @OneToMany(() => Bicycle, (bicycle) => bicycle.rentalPointId)  // ← исправлено на rentalPointId
  bicycles!: Bicycle[];

  @OneToMany(() => Rental, (rental) => rental.rentalPoint)
  rentals!: Rental[];
}