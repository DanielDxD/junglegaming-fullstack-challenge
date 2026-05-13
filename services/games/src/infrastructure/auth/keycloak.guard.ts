import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException("Missing or invalid authorization header");
    }

    const token = authHeader.split(' ')[1];

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);

      if (!payload.sub) {
        throw new UnauthorizedException("Invalid token payload: missing sub (keycloakId)");
      }

      request.user = {
        keycloakId: payload.sub,
        ...payload
      };

      return true;
    } catch (e) {
      throw new UnauthorizedException("Invalid token format");
    }
  }
}
