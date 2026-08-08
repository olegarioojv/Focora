import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { ACCESS_TOKEN_COOKIE, authCookieOptions } from './cookie.constants';

interface OAuthProfile {
  providerId: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // Auth endpoints get a much tighter limit than the API default — these
  // are exactly the routes brute-force/credential-stuffing/mass-signup
  // scripts target.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('guest')
  async guest(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, user } = await this.authService.guestSession(
      this.sessionMeta(req),
    );
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, authCookieOptions());
    return { user };
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const guestToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
    const { accessToken, user } = await this.authService.register(
      dto,
      guestToken,
      this.sessionMeta(req),
    );
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, authCookieOptions());
    return { user };
  }

  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const guestToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
    const { accessToken, user } = await this.authService.login(
      dto,
      guestToken,
      this.sessionMeta(req),
    );
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, authCookieOptions());
    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Redirect to Google is handled entirely by the strategy.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback('google', req, res);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubAuth() {
    // Redirect to GitHub is handled entirely by the strategy.
  }

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(@Req() req: Request, @Res() res: Response) {
    await this.handleOAuthCallback('github', req, res);
  }

  private sessionMeta(req: Request) {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }

  private async handleOAuthCallback(
    provider: 'google' | 'github',
    req: Request,
    res: Response,
  ) {
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    // httpOnly cookies persist naturally through the top-level OAuth
    // redirect, so a pre-existing guest session is already available here
    // without needing to smuggle a token through the `state` param.
    const guestToken = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;

    try {
      const { accessToken } = await this.authService.loginWithOAuth(
        provider,
        req.user as OAuthProfile,
        guestToken,
        this.sessionMeta(req),
      );
      res.cookie(ACCESS_TOKEN_COOKIE, accessToken, authCookieOptions());
      res.redirect(`${frontendUrl}/oauth-callback`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível entrar';
      res.redirect(
        `${frontendUrl}/oauth-callback?error=${encodeURIComponent(message)}`,
      );
    }
  }
}
