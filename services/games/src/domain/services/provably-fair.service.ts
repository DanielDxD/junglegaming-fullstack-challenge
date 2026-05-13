import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class ProvablyFairService {
  private readonly salt = "SsbDqgbChxFsJHPCF+DSPwQ21333IT1mxx8rJwgA0Dl8Uk/I";

  generateRoundData() {
    const seed = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    const crashPoint = this.calculateCrashPoint(seed);
    return { seed, hash, crashPoint };
  }

  calculateCrashPoint(seed: string): number {
    const h = crypto.createHmac('sha256', seed).update(this.salt).digest('hex');
    const e = Math.pow(2, 52);
    const hVal = Number.parseInt(h.slice(0, 13), 16);

    if (hVal % 33 === 0) {
      return 1.00;
    }

    const crashPoint = Math.max(1.00, Math.floor((100 * e - hVal) / (e - hVal)) / 100);
    return crashPoint;
  }

  verifyCrashPoint(seed: string, expectedHash: string): boolean {
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    return hash === expectedHash;
  }
}
