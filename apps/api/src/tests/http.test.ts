import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app';

test('API starts and responds to the health check', async () => {
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  try {
    const response = await fetch(`${await app.getUrl()}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  } finally {
    await app.close();
  }
});
