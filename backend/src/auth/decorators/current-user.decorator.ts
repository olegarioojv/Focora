import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  name: string;
  isGuest: boolean;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
