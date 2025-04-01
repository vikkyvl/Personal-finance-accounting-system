export const patterns = {
  TRANSACTION: {
    CREATE: { cmd: 'create_transaction' },
    FIND_BY_USER: { cmd: 'get_transactions_by_user' },
    SUMMARY: { cmd: 'get_summary' },
  },
  USER: {
    CREATE: { cmd: 'create_user' },
    FIND_ALL: { cmd: 'find_all_users' },
    FIND_BY_ID: { cmd: 'find_user_by_id' },
    UPDATE: { cmd: 'update_user' },
    DELETE: { cmd: 'delete_user' },
    FIND_BY_EMAIL: { cmd: 'find_user_by_email' },
    RESET_PASSWORD: { cmd: 'reset_password' },
  },
  GOAL: {
    CREATE: { cmd: 'create_goal' },
    GET_BY_USER: { cmd: 'get_goals_by_user' },
    UPDATE: { cmd: 'update_goal' },
    UPDATE_AMOUNT: { cmd: 'update_goal_amount' },
  },
};

