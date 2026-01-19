import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for access from any origin (local network)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 4000;

  // Listen on all network interfaces (0.0.0.0)
  await app.listen(port, '0.0.0.0');

  console.log(`Backend running on:`);
  console.log(`  - Local:   http://192.168.4.69:${port}`);
  console.log(`  - Network: http://192.168.4.69:${port}`);
  console.log(`\nTo access from another device, use your network IP address.`);
  console.log(`Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)`);
}
bootstrap();
