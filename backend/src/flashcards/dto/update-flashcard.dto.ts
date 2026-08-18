import { Transform } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// SM-2 fields (easeFactor, intervalDays, repetitions, nextReviewDate) are
// intentionally absent — they're only ever changed via POST /flashcards/:id
// /review, never through a plain edit, so they must not be editable here.
export class UpdateFlashcardDto {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  front?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  back?: string;

  @IsOptional()
  @IsUUID()
  noteId?: string | null;

  @IsOptional()
  @IsUUID()
  subjectId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];
}
