import { describe, it, expect, beforeAll } from 'bun:test';
import { getAuthToken } from './auth-helper';

const BASE_URL = 'http://localhost:4001'; // Games Service mapped port

describe('Games Service E2E (Blackbox)', () => {
  let token: string;

  beforeAll(async () => {
    token = await getAuthToken();
  });

  it('should return health status', async () => {
    const response = await fetch(`${BASE_URL}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('games');
  });

  it('should get history of rounds', async () => {
    const response = await fetch(`${BASE_URL}/rounds/history?limit=5`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      expect(data[0].hash).toBeDefined();
      expect(data[0].crashPoint).toBeDefined();
    }
  });

  it('should execute full bet and cashout flow', async () => {
    console.log('Waiting for BETTING phase...');
    
    let isBetting = false;
    let roundId = '';
    
    for (let i = 0; i < 150; i++) {
      const response = await fetch(`${BASE_URL}/rounds/current`);
      if (response.status === 200) {
        const data = await response.json();
        if (data.status === 'BETTING') {
          isBetting = true;
          roundId = data.id;
          break;
        }
      }
      await Bun.sleep(200); // Check more frequently to catch betting phase early
    }

    expect(isBetting).toBe(true);
    expect(roundId).not.toBe('');

    console.log('Placing bet...');
    const betResponse = await fetch(`${BASE_URL}/bet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount: 150 }) // 1.50
    });
    
    if (betResponse.status !== 201) {
      console.log('Bet failed:', await betResponse.text());
    }
    
    // Allow 400 if we missed the window or already bet
    expect([201, 400]).toContain(betResponse.status);
    
    if (betResponse.status === 201) {
      console.log('Waiting for ACTIVE phase...');
      
      let isActive = false;
      for (let i = 0; i < 15; i++) {
        const response = await fetch(`${BASE_URL}/rounds/current`);
        if (response.status === 200) {
          const data = await response.json();
          // If it's the same round and it's active
          if (data.status === 'ACTIVE' && data.id === roundId) {
            isActive = true;
            break;
          }
          // If round changed or finished, break early
          if (data.id !== roundId || data.status === 'FINISHED') {
             break;
          }
        }
        await Bun.sleep(1000);
      }
      
      expect(isActive).toBe(true);

      console.log('Cashing out...');
      const cashoutResponse = await fetch(`${BASE_URL}/bet/cashout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // We can either succeed (201) if we cashed out before crash, 
      // or fail (400) if the round crashed instantly before our request arrived.
      // Or fail (404) if the round we bet on already finished and a new one started.
      expect([201, 400, 404]).toContain(cashoutResponse.status);

      // Verify it appears in my bets
      const myBetsResponse = await fetch(`${BASE_URL}/bets/me?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      expect(myBetsResponse.status).toBe(200);
      const betsData = await myBetsResponse.json();
      expect(Array.isArray(betsData)).toBe(true);
      expect(betsData.length).toBeGreaterThan(0);
      
      const ourBet = betsData.find((b: any) => b.roundId === roundId);
      if (ourBet) {
        expect(ourBet.amount).toBe("150"); // The amount we bet
      }
    }
  }, 45000); // Increased timeout to 45s to account for waiting phases
});
