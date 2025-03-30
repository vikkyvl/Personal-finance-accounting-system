import { Module } from '@nestjs/common';
import { OrmModule } from './orm/orm.module';
import { GoalModule } from './goal/goal.module';

@Module({
  imports: [OrmModule, GoalModule],
})
export class ModulesModule {}
