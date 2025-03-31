import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { GoalService } from './goal.service';
import { CreateGoalDto } from './dto/goal';

@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async create(@Body() data: CreateGoalDto) {
    return this.goalService.createGoal(data); // ✅ використовуємо сервіс, а не ClientProxy напряму
  }

  @Get(':userId')
  async getByUser(@Param('userId') userId: string) {
    return this.goalService.getGoalsByUser(userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() update: Partial<CreateGoalDto>) {
    return this.goalService.updateGoal(id, update);
  }
}


