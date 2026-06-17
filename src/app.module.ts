import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { DatabaseModule } from './database/database.module';
import { ContaPagarModule } from './modules/conta-pagar/conta-pagar.module';
import { ContaReceberModule } from './modules/conta-receber/conta-receber.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { FuncionarioModule } from './modules/funcionario/funcionario.module';
import { PedidoCompraModule } from './modules/pedido-compra/pedido-compra.module';
import { PedidoVendaModule } from './modules/pedido-venda/pedido-venda.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { UsuarioModule } from './modules/usuario/usuario.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ClienteModule,
    ContaPagarModule,
    ContaReceberModule,
    DatabaseModule,
    FornecedorModule,
    FuncionarioModule,
    PedidoCompraModule,
    PedidoVendaModule,
    ProdutoModule,
    UsuarioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
