import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateGroupDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsString()
  icon: string;

  @IsIn(['public', 'private'])
  type: 'public' | 'private';

  @IsInt()
  @Min(2)
  @Max(200)
  maxMembers: number;
}
