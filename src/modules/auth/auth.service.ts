import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import { UsuarioService } from "../usuario/usuario.service";
import { LoginDto } from "./dto/login-dto";
import { JwtPayload } from "./auth.types";

@Injectable()
export class AuthService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly configService: ConfigService,
    ) {}

    async login(dados: LoginDto) {
        const usuario = await this.usuarioService.findByEmail(dados.email);

        if (!usuario || !this.usuarioService.validatePassword(dados.senha, usuario.senhaHash)) {
            throw new UnauthorizedException('Email ou senha invalidos.');
        }

        const payload: JwtPayload = {
            sub: usuario.id,
            email: usuario.email,
            funcionarioId: usuario.funcionarioId,
        };

        return {
            accessToken: this.signToken(payload),
            usuario: payload,
        };
    }

    verifyToken(token: string): JwtPayload {
        try {
            const [encodedHeader, encodedPayload, signature] = token.split('.');

            if (!encodedHeader || !encodedPayload || !signature) {
                throw new Error('Invalid token');
            }

            const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

            if (!this.safeCompare(signature, expectedSignature)) {
                throw new Error('Invalid signature');
            }

            const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as JwtPayload & { exp?: number };

            if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                throw new Error('Expired token');
            }

            return {
                sub: payload.sub,
                email: payload.email,
                funcionarioId: payload.funcionarioId,
            };
        } catch {
            throw new UnauthorizedException('Token invalido ou expirado.');
        }
    }

    private signToken(payload: JwtPayload): string {
        const header = {
            alg: 'HS256',
            typ: 'JWT',
        };
        const body = {
            ...payload,
            exp: Math.floor(Date.now() / 1000) + this.getExpiresInSeconds(),
        };
        const encodedHeader = this.base64Url(header);
        const encodedPayload = this.base64Url(body);
        const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    private base64Url(value: object): string {
        return Buffer.from(JSON.stringify(value)).toString('base64url');
    }

    private createSignature(data: string): string {
        return createHmac('sha256', this.getJwtSecret()).update(data).digest('base64url');
    }

    private safeCompare(value: string, expected: string): boolean {
        const valueBuffer = Buffer.from(value);
        const expectedBuffer = Buffer.from(expected);

        return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer);
    }

    private getExpiresInSeconds(): number {
        const value = this.configService.get<string>('JWT_EXPIRES_IN', '1d');
        const match = value.match(/^(\d+)([smhd])$/);

        if (!match) {
            return 86400;
        }

        const amount = Number(match[1]);
        const unit = match[2];
        const multipliers: Record<string, number> = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };

        return amount * multipliers[unit];
    }

    private getJwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET', 'grill-system-secret');
    }
}
