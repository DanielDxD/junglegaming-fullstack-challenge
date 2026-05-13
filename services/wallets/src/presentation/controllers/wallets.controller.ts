import { Controller, Get, Post, UseGuards, ConflictException } from "@nestjs/common";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";
import { CreateWalletUseCase } from "../../application/usecases/create-wallet.usecase";
import { GetWalletUseCase } from "../../application/usecases/get-wallet.usecase";
import { KeycloakAuthGuard, CurrentUser } from "../../infrastructure/auth/keycloak.guard";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Wallet } from "@/domain/entities/wallet.entity";
import { WalletResponse } from "../dtos/wallet-response.dto";
import { ErrorResponse } from "../dtos/error-response.dto";

@Controller()
export class WalletsController {
  constructor(
    private readonly createWalletUseCase: CreateWalletUseCase,
    private readonly getWalletUseCase: GetWalletUseCase,
  ) { }

  @Get("health")
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "wallets" };
  }

  @Post()
  @UseGuards(KeycloakAuthGuard)
  @ApiOperation({ summary: "Create wallet", description: "Create a new wallet for the authenticated user" })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: "Wallet created successfully", type: WalletResponse })
  @ApiResponse({ status: 409, description: "Wallet already exists", type: ErrorResponse })
  async createWallet(@CurrentUser() user: any) {
    const wallet = await this.createWalletUseCase.execute(user.keycloakId);

    return {
      id: wallet.id,
      keycloakId: wallet.keycloakId,
      balance: wallet.balance.toString(),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    };
  }

  @Get("me")
  @UseGuards(KeycloakAuthGuard)
  @ApiOperation({ summary: "Get my wallet", description: "Get the wallet of the authenticated user" })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "Wallet found successfully", type: WalletResponse })
  @ApiResponse({ status: 404, description: "Wallet not found", type: ErrorResponse })
  async getMyWallet(@CurrentUser() user: any) {
    const wallet = await this.getWalletUseCase.execute(user.keycloakId);

    return {
      id: wallet.id,
      keycloakId: wallet.keycloakId,
      balance: wallet.balance.toString(),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt
    };
  }
}
