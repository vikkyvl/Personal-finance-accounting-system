import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity('transactions')
  export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    user_id: string;
  
    @Column('decimal')
    amount: number;
  
    @Column({
      type: 'enum',
      enum: ['income', 'expense'],
    })
    type: 'income' | 'expense';
  
    @Column()
    category: string;
  
    @Column('text', { nullable: true })
    description: string;
  
    @Column({ type: 'timestamp' })
    transaction_date: Date;
  
    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
  }
  