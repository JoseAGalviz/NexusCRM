"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
require("dotenv/config");
async function test() {
    console.log('ENV DB_HOST:', process.env.DB_HOST);
    console.log('ENV DB_NAME:', process.env.DB_NAME);
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('DataSource initialized');
        console.log('Loaded entities:', data_source_1.AppDataSource.entityMetadatas.map(m => m.name));
        await data_source_1.AppDataSource.destroy();
    }
    catch (err) {
        console.error('Error during initialization:', err);
    }
}
test();
//# sourceMappingURL=test-entities.js.map