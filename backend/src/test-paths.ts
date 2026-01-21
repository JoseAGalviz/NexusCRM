import * as path from 'path';
import * as glob from 'glob';

const entitiesPath = path.join(__dirname, '**', '*.entity{.ts,.js}');
console.log('Search pattern:', entitiesPath);

// Note: glob package might be needed, or I can just use a simple fs check
// But TypeORM uses glob internally.
// Let's see what __dirname is
console.log('__dirname:', __dirname);

import { AppDataSource } from './data-source';
console.log('AppDataSource entities:', AppDataSource.options.entities);
