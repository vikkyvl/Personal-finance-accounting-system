import { 
    Controller, 
    Post, 
    Body, 
    Get, 
    Param, 
    Put 
  } from '@nestjs/common';
  import { GoalService } from './goal.service';
  import { Goal } from './dto/goal';

@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async create(@Body() data: Goal) {
    return this.goalService.createGoal(data); 
  }

  @Get(':userId')
  async getByUser(@Param('userId') userId: string) {
    return this.goalService.getGoalsByUser(userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() update: Partial<Goal>) {
    return this.goalService.updateGoal(id, update);
  }
}


