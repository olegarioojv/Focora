import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsBoolean()
  notified?: boolean;
}
