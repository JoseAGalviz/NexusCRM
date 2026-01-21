"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
require("dotenv/config");
const root = __dirname.replace(/\\/g, '/');
exports.AppDataSource = new typeorm_1.DataSource({
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
//# sourceMappingURL=data-source.js.map