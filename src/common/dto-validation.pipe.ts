import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { validateSync } from "class-validator";

@Injectable()
export class DtoValidationPipe implements PipeTransform {
    transform(value: unknown, metadata: ArgumentMetadata): unknown {
        const { metatype } = metadata;

        if (!metatype || !this.shouldValidate(metatype)) {
            return value;
        }

        const object = Object.assign(new metatype(), value);
        const errors = validateSync(object, {
            whitelist: true,
            forbidNonWhitelisted: false,
        });

        if (errors.length > 0) {
            const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
            throw new BadRequestException(messages);
        }

        return object;
    }

    private shouldValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}
