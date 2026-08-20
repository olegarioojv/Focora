import { IsIn } from 'class-validator';
import type { FlashcardRating } from '../sm2.util';

export class ReviewFlashcardDto {
  @IsIn(['again', 'hard', 'good', 'easy'])
  rating: FlashcardRating;
}
