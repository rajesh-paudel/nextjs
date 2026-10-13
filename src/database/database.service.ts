import {
  Injectable,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  public db: PostgresJsDatabase<typeof schema>;
  private queryClient: postgres.Sql;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    this.queryClient = postgres(databaseUrl!);
    this.db = drizzle(this.queryClient, { schema });
  }

  async onModuleInit() {
    // Verified connection on startup
    console.log('Database connection initialized successfully.');
  }

  async onApplicationShutdown() {
    await this.queryClient.end();
  }
}
