import { Module } from "@nestjs/common";
import { ContaReceberController } from "./conta-receber.controller";
import { ContaReceberService } from "./conta-receber.service";

@Module({
    imports: [],
    controllers: [ContaReceberController],
    providers: [ContaReceberService],
})
export class ContaReceberModule {}
