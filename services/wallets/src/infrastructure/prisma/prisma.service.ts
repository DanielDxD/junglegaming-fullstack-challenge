import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../database/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@/config/env';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    public constructor() {
        super({
            log: ["error", "info", "query", "warn"],
            adapter: new PrismaPg({
                connectionString: env.DATABASE_URL,
            }),
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
