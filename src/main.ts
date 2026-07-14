import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Optionally load a local `.env` (no extra dependency — Node ≥ 20.12).
// If the file is absent, ignore and rely on the real environment / defaults.
try {
  (process as NodeJS.Process & { loadEnvFile?: () => void }).loadEnvFile?.();
} catch {
  /* no .env file present — that's fine */
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ────────────────────────────────────────────────────────────────
  // CORS_ORIGINS: comma-separated allowlist (e.g. the dashboard localhost/LAN
  //   origin, the landing page origin, the production frontend origin).
  // CORS_CREDENTIALS=true: only when auth needs cookies/credentialed requests.
  //
  // This app authenticates with a Bearer JWT (localStorage), NOT cookies, so
  // credentials default to false. We therefore NEVER pair wildcard origins with
  // credentials. When no allowlist is set we reflect any origin (dev/LAN only)
  // — safe precisely because credentials are off — so a phone on the same
  // Wi-Fi can read the public booth map out of the box.
  const allowlist = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : null;
  const credentials = process.env.CORS_CREDENTIALS === 'true';

  app.enableCors({
    // With credentials we require an explicit allowlist (never reflect-all).
    // Without credentials, reflecting any origin is safe for LAN/dev.
    origin: allowlist ?? (credentials ? false : true),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials,
  });

  // ── Network binding ──────────────────────────────────────────────────────
  // HOST=0.0.0.0 lets other devices on the same Wi-Fi reach the API.
  // Override PORT/HOST via environment for production as needed.
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  console.log(`API listening on http://${host}:${port}`);
}
void bootstrap();
