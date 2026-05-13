import { describe, it, expect, beforeAll } from 'bun:test';
import { getAuthToken } from './auth-helper';

const BASE_URL = 'http://localhost:4002';

describe('Wallets Service E2E (Blackbox)', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  it('should return health status', async () => {
    const response = await fetch(`${BASE_URL}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('wallets');
  });

  it('should create a wallet or return 400 if already exists', async () => {
    const response = await fetch(`${BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 201 if created now, 409 if it was created in a previous test run
    expect([201, 409]).toContain(response.status);

    const data = await response.json();
    if (response.status === 201) {
      expect(data.balance).toBeDefined();
    }
  });

  it('should get current user wallet', async () => {
    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.id).toBeDefined();
    expect(data.keycloakId).toBeDefined();
    expect(data.balance).toBeDefined();
    expect(typeof data.balance).toBe('string');
  });
});
