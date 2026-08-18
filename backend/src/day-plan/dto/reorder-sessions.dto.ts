import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsString,
  ValidateNested,
} from 'class-validator';
import { WEEKDAYS } from '../day-plan.constants';

class ReorderChangeDto {
  @IsIn(WEEKDAYS)
  weekday: string;

  @IsArray()
  @IsString({ each: true })
  orderedIds: string[];
}

export class ReorderSessionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderChangeDto)
  changes: ReorderChangeDto[];
}
