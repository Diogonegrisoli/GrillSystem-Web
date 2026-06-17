export interface JwtPayload {
    sub: number;
    email: string;
    funcionarioId: number;
}

export interface AuthenticatedRequest {
    usuario?: JwtPayload;
    headers: {
        authorization?: string;
    };
}
