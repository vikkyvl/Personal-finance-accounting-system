export class CreateGoalDto {
    userId: string;
    goalName: string;
    targetAmount: number;
    currentAmount?: number;
    deadline: string; // ISO string
    status?: 'in_progress' | 'completed' | 'failed';
  }
  