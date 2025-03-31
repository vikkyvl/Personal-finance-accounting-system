import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GoalService } from './goal.service';
import { GoalDTO } from './dto/goal.dto';

@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  // ---------- HTTP ----------
  @Post()
  async createGoal(@Body() dto: GoalDTO) {
    return this.goalService.createGoal(dto);
  }

  @Get(':userId')
  async getGoalsByUser(@Param('userId') userId: string) {
    return this.goalService.getGoalsByUser(userId);
  }

  @Put(':id')
  async updateGoal(@Param('id') id: string, @Body() dto: Partial<GoalDTO>) {
    return this.goalService.updateGoal(id, dto);
  }

  // ---------- RMQ (RabbitMQ) ----------
  @MessagePattern({ cmd: 'create_goal' })
  async createGoalRMQ(dto: GoalDTO) {
    return this.goalService.createGoal(dto);
  }

  @MessagePattern({ cmd: 'get_goals_by_user' })
  async getGoalsByUserRMQ(data: { userId: string }) {
    return this.goalService.getGoalsByUser(data.userId);
  }

  @MessagePattern({ cmd: 'update_goal' })
  async updateGoalRMQ(data: { id: string } & Partial<GoalDTO>) {
    return this.goalService.updateGoal(data.id, data);
  }
}

  