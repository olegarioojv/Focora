import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      // Falls back to a placeholder so Nest can still boot when the real
      // GitHub OAuth app hasn't been configured yet in .env — the actual
      // /auth/github route will just fail at GitHub's side until then.
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || 'not-configured',
      clientSecret:
        configService.get<string>('GITHUB_CLIENT_SECRET') || 'not-configured',
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      providerId: profile.id,
      email: profile.emails?.[0]?.value ?? null,
      name: profile.displayName || profile.username || 'Usuário GitHub',
      avatarUrl: profile.photos?.[0]?.value ?? null,
    };
  }
}
