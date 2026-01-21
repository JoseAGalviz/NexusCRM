import { DataSource } from 'typeorm';
import 'dotenv/config';
import * as path from 'path';

const root = __dirname.replace(/\\/g, '/');

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [root + '/**/*.entity{.ts,.js}'],
    migrations: [root + '/migrations/**/*{.ts,.js}'],
    synchronize: false,
});
