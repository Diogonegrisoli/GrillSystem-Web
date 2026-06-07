import { Module } from "@nestjs/common";
import { FornecedorController } from "./fornecedor.controller";
import { FornecedorService } from "./fornecedor.service";

@Module({
    imports: [],
    controllers: [FornecedorController],
    providers: [FornecedorService],
})
export class FornecedorModule {}
