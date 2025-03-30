import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity('goals')
  export class Goal {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    user_id: string;
  
    @Column({ type: 'varchar' })
    goal_name: string;
  
    @Column({ type: 'decimal' })
    target_amount: number;
  
    @Column({ type: 'decimal', default: 0 })
    current_amount: number;
  
    @Column({ type: 'timestamp' })
    deadline: Date;
  
    @Column({
      type: 'enum',
      enum: ['in_progress', 'completed', 'failed'],
      default: 'in_progress',
    })
    status: 'in_progress' | 'completed' | 'failed';
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  }
  