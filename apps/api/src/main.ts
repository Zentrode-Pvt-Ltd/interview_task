import { createApp } from './app';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const app = await createApp();
  await app.listen(port, process.env.HOST ?? '127.0.0.1');
  console.log(`Inventory API listening on http://localhost:${port}/api`);
}
bootstrap().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
