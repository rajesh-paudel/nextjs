import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { eq } from 'drizzle-orm';
import { users, User, NewUser } from '../database/schema.js';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private dbService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const [existingUser] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, createUserDto.email));
    if (existingUser) {
      throw new BadRequestException(' Email is already registered!');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const [newUser] = await this.dbService.db
      .insert(users)
      .values({
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
      } as NewUser)
      .returning();

    const { password, ...result } = newUser;
    return result;
  }

  async findByEmail(email: string) {
    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }
}
