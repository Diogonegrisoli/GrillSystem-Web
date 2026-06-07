import { Module } from "@nestjs/common";
import { ProdutoController } from "./produto.controller";
import { ProdutoService } from "./produto.service";

@Module({
    imports: [],
    controllers: [ProdutoController],
    providers: [ProdutoService],
})
export class ProdutoModule {}
