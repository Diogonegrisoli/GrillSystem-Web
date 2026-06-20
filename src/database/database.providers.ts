import {ConfigService} from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DATABASE_SOURCE } from 'src/constants/database-source';
import { join } from 'path';

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (value  === undefined) return fallback;
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

export const databaseProviders = [
    {
        provide: DATABASE_SOURCE,
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const dataSource = new DataSource({
                type: 'mysql',
                host: configService.get<string>('DB_HOST'),
                port: Number(configService.get<string>('DB_PORT')),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [join(__dirname, '..', '**', '*.entity.js')],
                synchronize: toBoolean(
                    configService.get<string>('DB_SYNCHRONIZE', 'false'),
                    false,
                ),
                logging: toBoolean(
                    configService.get<string>('DB_LOGGING', 'false'),
                    false,
                ),
            });

            return dataSource.initialize();
        }
    }
]
