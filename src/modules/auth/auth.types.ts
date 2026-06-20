export interface JwtPayload {
    sub: number;
    email: string;
    funcionarioId: number;
}

export interface AuthenticatedRequest {
    usuario?: JwtPayload;
    url: string;
    headers: {
        authorization?: string;
        cookie?: string;
        accept?: string;
    };
}
