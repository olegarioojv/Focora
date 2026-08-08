import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      // Falls back to a placeholder so Nest can still boot when the real
      // Google OAuth app hasn't been configured yet in .env — the actual
      // /auth/google route will just fail at Google's side until then.
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'not-configured',
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') || 'not-configured',
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}
