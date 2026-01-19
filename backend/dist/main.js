"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        credentials: true,
    });
    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`Backend running on:`);
    console.log(`  - Local:   http://192.168.4.69:${port}`);
    console.log(`  - Network: http://192.168.4.69:${port}`);
    console.log(`\nTo access from another device, use your network IP address.`);
    console.log(`Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)`);
}
bootstrap();
//# sourceMappingURL=main.js.map