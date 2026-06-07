import { Module } from "@nestjs/common";
import { ContaPagarController } from "./conta-pagar.controller";
import { ContaPagarService } from "./conta-pagar.service";

@Module({
    imports: [],
    controllers: [ContaPagarController],
    providers: [ContaPagarService],
})
export class ContaPagarModule {}
