import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';

export class CreateReviewsBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReviewDto)
  reviews: CreateReviewDto[];
}
