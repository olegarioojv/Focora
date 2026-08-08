import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  // The frontend already resizes uploads to a small (256px) image before
  // sending this — the length cap just stops a direct API call from
  // storing an arbitrary-size (or non-image) string as the avatar.
  @IsOptional()
  @IsString()
  @MaxLength(500_000)
  avatarUrl?: string | null;
}
