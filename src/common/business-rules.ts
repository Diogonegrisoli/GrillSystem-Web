import { BadRequestException } from "@nestjs/common";
import { In } from "typeorm";
import { Produto } from "src/modules/produto/produto.entity";

export const onlyNumbers = (value: string): string => value.replace(/\D/g, '');

export const validateCpf = (cpfValue: string): boolean => {
    const cpf = onlyNumbers(cpfValue);

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    const calculateDigit = (base: string, factor: number): number => {
        const total = base
            .split('')
            .reduce((sum, digit) => sum + Number(digit) * factor--, 0);
        const rest = (total * 10) % 11;
        return rest === 10 ? 0 : rest;
    };

    const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
    const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

    return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
};

export const validateCnpj = (cnpjValue: string): boolean => {
    const cnpj = onlyNumbers(cnpjValue);

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
        return false;
    }

    const calculateDigit = (base: string, weights: number[]): number => {
        const total = base
            .split('')
            .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
        const rest = total % 11;
        return rest < 2 ? 0 : 11 - rest;
    };

    const firstDigit = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const secondDigit = calculateDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

    return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
};

export const ensurePositive = (value: number, fieldName: string): void => {
    if (value <= 0) {
        throw new BadRequestException(`${fieldName} deve ser maior que zero.`);
    }
};

export const ensureNotNegative = (value: number, fieldName: string): void => {
    if (value < 0) {
        throw new BadRequestException(`${fieldName} nao pode ser menor que zero.`);
    }
};

export const ensureDateNotBefore = (date: Date | null | undefined, reference: Date, fieldName: string, referenceName: string): void => {
    if (date && startOfDay(date) < startOfDay(reference)) {
        throw new BadRequestException(`${fieldName} nao pode ser menor que ${referenceName}.`);
    }
};

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const calculateProductsTotal = async (produtoIds: number[] | undefined): Promise<{ produtos: Produto[]; valorTotal: number }> => {
    if (!produtoIds || produtoIds.length === 0) {
        throw new BadRequestException('Informe ao menos um produto.');
    }

    const uniqueIds = [...new Set(produtoIds)];
    const produtos = await Produto.find({
        where: {
            id: In(uniqueIds),
        },
    });

    if (produtos.length !== uniqueIds.length) {
        throw new BadRequestException('Um ou mais produtos informados nao foram encontrados.');
    }

    const valorTotal = produtos.reduce((total, produto) => total + Number(produto.preco), 0);

    return { produtos, valorTotal };
};
