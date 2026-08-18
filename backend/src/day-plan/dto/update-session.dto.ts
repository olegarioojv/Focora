import { IsBoolean } from 'class-validator';

export class UpdateSessionDto {
  @IsBoolean()
  completed: boolean;
}
