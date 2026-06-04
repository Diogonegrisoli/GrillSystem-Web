import { Module } from "@nestjs/common";
import { ClienteController } from "./cliente.controller";
import { clienteService } from "./cliente.service";

@Module({
    imports:[],
    controllers: [ClienteController],
    providers: [clienteService],
})

export class ClienteModule {}