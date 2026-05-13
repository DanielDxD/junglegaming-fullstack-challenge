import { describe, it, expect, beforeEach } from 'bun:test';
import { ProvablyFairService } from '../../src/domain/services/provably-fair.service';

describe('ProvablyFairService', () => {
  let service: ProvablyFairService;

  beforeEach(() => {
    service = new ProvablyFairService();
  });

  it('should generate valid round data', () => {
    const data = service.generateRoundData();
    expect(data.seed).toBeDefined();
    expect(data.hash).toBeDefined();
    expect(data.crashPoint).toBeGreaterThanOrEqual(1.00);
  });

  it('should calculate deterministic crash point for same seed', () => {
    const seed = 'test-seed-123';
    const point1 = service.calculateCrashPoint(seed);
    const point2 = service.calculateCrashPoint(seed);
    expect(point1).toBe(point2);
  });

  it('should verify correct seed and hash', () => {
    const data = service.generateRoundData();
    const isValid = service.verifyCrashPoint(data.seed, data.hash);
    expect(isValid).toBe(true);
  });

  it('should reject invalid seed for hash', () => {
    const data = service.generateRoundData();
    const isValid = service.verifyCrashPoint('wrong-seed', data.hash);
    expect(isValid).toBe(false);
  });
});
