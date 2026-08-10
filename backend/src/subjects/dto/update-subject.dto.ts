import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateSubjectDto } from './create-subject.dto';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {
  // Update-only: a subject always starts at 0 completed lessons, so this
  // has no place in CreateSubjectDto — it's only ever adjusted afterward,
  // via the card's +/- stepper or the edit form.
  @IsOptional()
  @IsInt()
  @Min(0)
  completedLessons?: number;
}
