// src/systemInformation.spec.ts
import http, { Server } from 'http';
import type { AddressInfo } from 'net';

// Timeout large (Windows + CI)
jest.setTimeout(20000);

// 🔧 Mock rapide et stable de 'systeminformation'
jest.mock('systeminformation', () => ({
  __esModule: true,
  default: {
    cpu: jest.fn().mockResolvedValue({ manufacturer: 'MockCPU', brand: 'MockBrand' }),
    mem: jest.fn().mockResolvedValue({ total: 16_000_000_000, free: 8_000_000_000 }),
    osInfo: jest.fn().mockResolvedValue({ platform: 'win32', distro: 'Windows', release: '10' }),
  },
}));

// 👉 importer APRÈS le mock
import { requestHandler } from './index';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = http.createServer(requestHandler);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve()))
  );
});

test('GET /api/v1/sysinfo -> 200 + contient cpu/memory/os', async () => {
  const res = await fetch(`${baseUrl}/api/v1/sysinfo`);
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json).toHaveProperty('cpu');
  expect(json).toHaveProperty('memory');
  expect(json).toHaveProperty('os');
});

// Toutes les autres routes doivent renvoyer 404
test('GET / -> 404', async () => {
  const res = await fetch(`${baseUrl}/`);
  expect(res.status).toBe(404);
});

test('GET /info -> 404', async () => {
  const res = await fetch(`${baseUrl}/info`);
  expect(res.status).toBe(404);
});

// Mauvaise méthode -> 405 même sur le bon chemin
test('POST /api/v1/sysinfo -> 405', async () => {
  const res = await fetch(`${baseUrl}/api/v1/sysinfo`, { method: 'POST' });
  expect(res.status).toBe(405);
});
