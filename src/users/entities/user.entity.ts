import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Task } from '../../tasks/entities/task.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  // @ts-expect-error - TypeORM generates this property dynamically
  id: string;

  @Column({ unique: true })
  // @ts-expect-error - TypeORM generates this property dynamically
  email: string;

  @Column()
  @Exclude()
  // @ts-expect-error - TypeORM generates this property dynamically
  password: string;

  @Column()
  // @ts-expect-error - TypeORM generates this property dynamically
  fullName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  // @ts-expect-error - TypeORM generates this property dynamically
  role: UserRole;

  @Column({ default: true })
  // @ts-expect-error - TypeORM generates this property dynamically
  isActive: boolean;

  @CreateDateColumn()
  // @ts-expect-error - TypeORM generates this property dynamically
  createdAt: Date;

  @UpdateDateColumn()
  // @ts-expect-error - TypeORM generates this property dynamically
  updatedAt: Date;

  @OneToMany(() => Task, (task) => task.user)
  // @ts-expect-error - TypeORM generates this property dynamically
  tasks: Task[];
}
