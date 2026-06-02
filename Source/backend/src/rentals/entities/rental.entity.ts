import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bicycle } from '../../bicycles/entities/bicycle.entity';
import { RentalPoint } from '../../rental-points/entities/rental-point.entity';

@Entity('rentals')
export class Rental {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.rentals)
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Bicycle, (bicycle) => bicycle.rentals)
  bicycle!: Bicycle;

  @Column()
  bicycleId!: number;

  @ManyToOne(() => RentalPoint, (point) => point.rentals)
  rentalPoint!: RentalPoint;

  @Column()
  pointId!: number;

  @Column()
  hours!: number;

  @Column()
  startDate!: string;

  @Column({ nullable: true })
  endDate!: string;

  @Column('decimal')
  totalPrice!: number;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}