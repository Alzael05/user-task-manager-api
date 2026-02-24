import { createApp } from './app/app.bootstrap';

async function bootstrap() {
  const app = await createApp();

  const port = process.env.PORT || 3000;

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation: http://localhost:${port}/api/openapi-yaml`,
  );

  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
