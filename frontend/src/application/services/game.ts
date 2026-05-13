import { ApiService } from "./api";
import { Round, CrashPoint, VerifyRoundResult } from "@/domain/entities/round";
import { PlayerBet } from "@/domain/entities/bet";

export class GameService extends ApiService {
    public constructor() {
        super("/games")
    }

    public async getCurrentRound(): Promise<Round | null> {
        const { data } = await this.api.get('/rounds/current');
        return data;
    }

    public async getHistory(limit = 20): Promise<CrashPoint[]> {
        const { data } = await this.api.get(`/rounds/history?limit=${limit}`);
        return data;
    }

    public async getMyBets(limit = 20): Promise<PlayerBet[]> {
        const { data } = await this.api.get(`/bets/me?limit=${limit}`);
        return data;
    }

    public async placeBet(amount: number, autoCashoutMultiplier?: number): Promise<{ success: boolean }> {
        const { data } = await this.api.post('/bet', { amount, autoCashoutMultiplier });
        return data;
    }

    public async cashout(): Promise<{ success: boolean }> {
        const { data } = await this.api.post('/bet/cashout');
        return data;
    }

    public async verifyRound(roundId: string): Promise<VerifyRoundResult> {
        const { data } = await this.api.get(`/rounds/${roundId}/verify`);
        return data;
    }
}