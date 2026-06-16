import { Module } from "@nestjs/common";
import { ClienteController } from "./cliente.controller";
import { ClienteService } from "./cliente.service";

@Module({
    imports:[],
    controllers: [ClienteController],
    providers: [ClienteService],
})

export class ClienteModule {}