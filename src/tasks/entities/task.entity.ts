import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  // @ts-expect-error - TypeORM generates this property dynamically
  id: string;

  @Column()
  // @ts-expect-error - TypeORM generates this property dynamically
  title: string;

  @Column({ type: 'text', nullable: true })
  // @ts-expect-error - TypeORM generates this property dynamically
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  // @ts-expect-error - TypeORM generates this property dynamically
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  // @ts-expect-error - TypeORM generates this property dynamically
  priority: TaskPriority;

  @Column({ type: 'timestamp', nullable: true })
  // @ts-expect-error - TypeORM generates this property dynamically
  dueDate: Date;

  @Column('uuid')
  // @ts-expect-error - TypeORM generates this property dynamically
  userId: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  // @ts-expect-error - TypeORM generates this property dynamically
  user: User;

  @CreateDateColumn()
  // @ts-expect-error - TypeORM generates this property dynamically
  createdAt: Date;

  @UpdateDateColumn()
  // @ts-expect-error - TypeORM generates this property dynamically
  updatedAt: Date;
}
