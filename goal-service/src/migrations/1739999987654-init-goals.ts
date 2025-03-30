import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitGoals1739999987654 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        goal_name VARCHAR NOT NULL,
        target_amount DECIMAL NOT NULL,
        current_amount DECIMAL DEFAULT 0,
        deadline TIMESTAMP NOT NULL,
        status VARCHAR CHECK (status IN ('in_progress', 'completed', 'failed')) DEFAULT 'in_progress',
        created_at TIMESTAMP DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS goals`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
