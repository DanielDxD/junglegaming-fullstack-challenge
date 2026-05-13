import { ApiService } from "./api";
import { Wallet } from "@/domain/entities/wallet";

export class WalletService extends ApiService {
    public constructor() {
        super("/wallets")
    }

    public async getMyWallet(): Promise<Wallet> {
        const { data } = await this.api.get('/me');
        return data;
    }

    public async createWallet(): Promise<Wallet> {
        const { data } = await this.api.post('/');
        return data;
    }
}