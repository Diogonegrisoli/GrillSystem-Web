import { Body, Controller, Get, Post, Render, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/public.decorator';
import { AuthService } from './modules/auth/auth.service';
import { LoginDto } from './modules/auth/dto/login-dto';
import type { AuthenticatedRequest } from './modules/auth/auth.types';
import { Funcionario } from './modules/funcionario/funcionario.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Get('login')
  @Render('auth/login')
  getLogin() {
    return { erro: null, email: '' };
  }

  @Public()
  @Post('login')
  async loginFromView(
    @Body() dados: LoginDto,
    @Res() res: any,
  ) {
    try {
      const result = await this.authService.login(dados);
      res.cookie('grill_access_token', result.accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production' || process.env.HTTPS_ENABLED !== 'false',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.redirect('/');
    } catch {
      return res.status(401).render('auth/login', {
        erro: 'E-mail ou senha invalidos.',
        email: dados.email ?? '',
      });
    }
  }

  @Post('logout')
  logout(@Res() res: any) {
    res.clearCookie('grill_access_token');
    return res.redirect('/login');
  }

  @Public()
  @Get()
  @Render('cliente/inicial')
  async getHome(@Req() request: AuthenticatedRequest) {
    const funcionario = request.usuario?.funcionarioId
      ? await Funcionario.findOne({ where: { id: request.usuario.funcionarioId } })
      : null;

    return {
      nome: funcionario?.nome ?? request.usuario?.email ?? 'Usuario',
    };
  }

  @Public()
  @Get('financeiro')
  @Render('financeiro/index')
  getFinanceiro() {
    return {};
  }
}
