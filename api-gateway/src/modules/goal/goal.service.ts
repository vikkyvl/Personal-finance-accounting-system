import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateGoalDto } from './dto/goal';

@Injectable()
export class GoalService {
  constructor(
    @Inject('GOAL_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  createGoal(data: CreateGoalDto) {
    // мапимо camelCase → snake_case
    const mapped = {
      user_id: data.userId,
      goal_name: data.goalName,
      target_amount: data.targetAmount,
      current_amount: data.currentAmount || 0,
      deadline: data.deadline,
      status: data.status || 'in_progress',
    };

    return this.client.send({ cmd: 'create_goal' }, mapped).toPromise();
  }

  getGoalsByUser(userId: string) {
    return this.client.send({ cmd: 'get_goals_by_user' }, { userId }).toPromise();
  }

  updateGoal(id: string, update: Partial<CreateGoalDto>) {
    return this.client
      .send({ cmd: 'update_goal' }, { id, ...update })
      .toPromise();
  }
}
