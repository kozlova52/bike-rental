import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Rental } from '../../rentals/entities/rental.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  age!: number;

  @Column({ nullable: true })
  phone?: string;

  @Column({ default: 'client' })
  role!: string;

  @Column()  
  password!: string;

  @OneToMany(() => Rental, (rental) => rental.user)
  rentals!: Rental[];
}