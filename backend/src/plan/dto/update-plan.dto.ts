import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsObject()
  availability?: Record<string, number>;

  @IsOptional()
  @IsObject()
  schedule?: Record<string, unknown> | null;
}
