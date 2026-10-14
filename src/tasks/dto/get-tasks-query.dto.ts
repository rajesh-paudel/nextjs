import { IsOptional, IsBoolean, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTaskQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
