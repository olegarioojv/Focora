import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    return true;
  }
}
