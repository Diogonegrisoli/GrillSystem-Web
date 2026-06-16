import { IsNotEmpty } from "class-validator";

export class UpdateClienteDto{
    @IsNotEmpty({message: 'O nome é obrigatório'})
    nome!: string;
    
    telefone!: string;

    endereco!: string;
}