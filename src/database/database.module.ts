import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service.js';

@Global() // Makes DatabaseService available globally without re-importing in every module
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
