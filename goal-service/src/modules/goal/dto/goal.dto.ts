export interface GoalDTO {
    user_id: string;
    goal_name: string;
    target_amount: number;
    current_amount?: number;
    deadline: Date;
    status?: 'in_progress' | 'completed' | 'failed';
  }
  