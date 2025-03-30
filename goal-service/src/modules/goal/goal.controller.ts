import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Put,
  } from '@nestjs/common';
  import { GoalService } from './goal.service';
  import { GoalDTO } from './dto/goal.dto';
  
  @Controller('goals')
  export class GoalController {
    constructor(private readonly goalService: GoalService) {}
  
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
  }
  