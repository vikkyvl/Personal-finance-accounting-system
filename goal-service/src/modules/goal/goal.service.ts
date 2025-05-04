import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from '../../entities/goal.entity';
import { GoalDTO } from './dto/goal.dto';

@Injectable()
export class GoalService {
  constructor(
      @InjectRepository(Goal)
      private readonly goalRepository: Repository<Goal>,
  ) {}

  async createGoal(dto: GoalDTO): Promise<Goal> {
    const goal = this.goalRepository.create(dto);

    const deadlineDate = new Date(goal.deadline);
    const today = new Date();
    if (deadlineDate < today) {
        goal.status = 'failed';
    }
    
    return await this.goalRepository.save(goal);
  }

  async getGoalsByUser(userId: string): Promise<Goal[]> {
    return await this.goalRepository.find({
      where: { user_id: userId },
      order: { deadline: 'ASC' },
    });
  }

  async updateGoal(id: string, dto: Partial<GoalDTO>): Promise<Goal> {
    const goal = await this.goalRepository.findOne({ where: { id } });
    if (!goal) {
        throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    const updatedGoal = this.goalRepository.merge(goal, dto);

    const deadlineDate = new Date(updatedGoal.deadline);
    const today = new Date();

    const currentAmount = Number(updatedGoal.current_amount);
    const targetAmount = Number(updatedGoal.target_amount);

    if (currentAmount >= targetAmount) {
        updatedGoal.status = 'completed';
    } else if (deadlineDate < today && currentAmount < targetAmount) {
        updatedGoal.status = 'failed';
    }

    await this.goalRepository.save(updatedGoal);

    return updatedGoal;
  }

  async updateCurrentAmount(userId: string, amountToAdd: number): Promise<void> {
    const goals = await this.goalRepository.find({ where: { user_id: userId } });

    for (const goal of goals) {
      if (goal.status !== 'in_progress') continue;

      goal.current_amount = Number(goal.current_amount) + amountToAdd;

      if (goal.current_amount >= goal.target_amount) {
        goal.status = 'completed';
      }

      await this.goalRepository.save(goal);
    }
  }
}