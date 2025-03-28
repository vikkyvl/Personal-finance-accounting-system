class ConfigService { 
  constructor(private env: string | undefined) {}

  public isProduction(): boolean {
    return this.env === 'production';
  }

  public getEnv() {
    return this.env || 'development';
  }

  public getBrockerUri() {
    return process.env.BROKER_URI ?? 'amqp://guest:guest@127.0.0.1:5672';
  }
//TODO: public getJWT
  public getPort(): number {
    return Number(process.env.PORT) || 3001;
  }

  public getDatabaseName(): string {
    return process.env.DB_NAME || 'personal_finance_users';
  }
}

const configService = new ConfigService(process.env.NODE_ENV);

export { configService };
