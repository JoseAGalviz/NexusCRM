import { AppDataSource } from './data-source';
import 'dotenv/config';

async function test() {
    console.log('ENV DB_HOST:', process.env.DB_HOST);
    console.log('ENV DB_NAME:', process.env.DB_NAME);

    try {
        await AppDataSource.initialize();
        console.log('DataSource initialized');
        console.log('Loaded entities:', AppDataSource.entityMetadatas.map(m => m.name));
        await AppDataSource.destroy();
    } catch (err) {
        console.error('Error during initialization:', err);
    }
}

test();
