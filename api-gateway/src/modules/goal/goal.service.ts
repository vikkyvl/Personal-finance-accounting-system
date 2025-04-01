import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout, catchError, throwError, firstValueFrom } from 'rxjs';

import { Goal } from './dto/goal';
import { patterns } from '../patterns';

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);

  constructor(
    @Inject('GOAL_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  private send(pattern: any, data: any): Promise<unknown> {
    const res$ = this.client.send(pattern, data).pipe(
      timeout(30000),
      catchError((e: Error) => {
        this.logger.error(e.message);
        return throwError(() => e);
      }),
    );
    return firstValueFrom(res$);
  }

  async createGoal(dto: Goal) {
    this.logger.log('Creating goal');
    return this.send(patterns.GOAL.CREATE, dto);
  }

  async getGoalsByUser(userId: string) {
    this.logger.log(`Getting goals for user ${userId}`);
    return this.send(patterns.GOAL.GET_BY_USER, { userId });
  }

  async updateGoal(id: string, update: Partial<Goal>) {
    this.logger.log(`Updating goal with ID ${id}`);
    return this.send(patterns.GOAL.UPDATE, { id, ...update });
  }
}

