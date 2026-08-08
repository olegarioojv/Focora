import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateSubjectDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsString()
  color: string;

  @IsInt()
  @Min(1)
  @Max(5)
  priority: number;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  goal: string;

  @IsArray()
  @IsIn(WEEKDAYS, { each: true })
  preferredDays: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  imageUrl?: string | null;
}
