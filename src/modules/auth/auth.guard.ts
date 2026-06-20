import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticatedRequest } from "./auth.types";
import { AuthService } from "./auth.service";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        if (isPublic && this.isAuthenticationRoute(request.url)) {
            return true;
        }

        try {
            const token = this.extractToken(request);
            request.usuario = this.authService.verifyToken(token);
            return true;
        } catch (error) {
            if (request.headers.accept?.includes('text/html')) {
                const response = context.switchToHttp().getResponse();
                response.redirect('/login');
                return false;
            }

            throw error;
        }
    }

    private extractToken(request: AuthenticatedRequest): string {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];

        if (type === 'Bearer' && token) {
            return token;
        }

        const cookieToken = request.headers.cookie
            ?.split(';')
            .map((cookie) => cookie.trim().split('='))
            .find(([name]) => name === 'grill_access_token')?.[1];

        if (!cookieToken) {
            throw new UnauthorizedException('Token de autenticacao nao informado.');
        }

        return decodeURIComponent(cookieToken);
    }

    private isAuthenticationRoute(url: string): boolean {
        const path = url.split('?')[0];
        return path === '/login' || path === '/auth/login';
    }
}
