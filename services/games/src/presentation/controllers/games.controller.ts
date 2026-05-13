import { Controller, Get, Post, Body, Param, Query, BadRequestException, UseGuards, Header } from "@nestjs/common";
import { RoundRepository } from "../../domain/repositories/round.repository";
import { BetRepository } from "../../domain/repositories/bet.repository";
import { ProvablyFairService } from "../../domain/services/provably-fair.service";
import { PlaceBetUseCase } from "../../application/usecases/place-bet.usecase";
import { CashoutUseCase } from "../../application/usecases/cashout.usecase";
import { MetricsService } from "../../application/services/metrics.service";
import { CurrentUser } from "../../infrastructure/auth/current-user.decorator";
import { JwtPayload } from "../../infrastructure/auth/jwt-payload.interface";
import { KeycloakAuthGuard } from "../../infrastructure/auth/keycloak.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheckResponseDto } from "../dtos/health-check-response.dto";
import { CurrentRoundResponseDto } from "../dtos/current-round-response.dto";
import { RoundHistoryResponseDto } from "../dtos/round-history-response.dto";
import { VerifyRoundResponseDto } from "../dtos/verify-round-response.dto";
import { MyBetResponseDto } from "../dtos/my-bet-response.dto";
import { PlaceBetDto } from "../dtos/place-bet.dto";
import { SuccessResponseDto } from "../dtos/success-response.dto";

@ApiTags('Games')
@Controller()
export class GamesController {
  constructor(
    private readonly roundRepository: RoundRepository,
    private readonly betRepository: BetRepository,
    private readonly provablyFairService: ProvablyFairService,
    private readonly placeBetUseCase: PlaceBetUseCase,
    private readonly cashoutUseCase: CashoutUseCase,
    private readonly metricsService: MetricsService
  ) { }

  @Get("health")
  @ApiOperation({ summary: 'Health check', description: 'Returns the health status of the games service' })
  @ApiResponse({ status: 200, description: 'Service is healthy', type: HealthCheckResponseDto })
  check(): HealthCheckResponseDto {
    return { status: "ok", service: "games" };
  }

  @Get("metrics")
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Get prometheus metrics' })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  @Get('rounds/current')
  @ApiOperation({ summary: 'Get current round', description: 'Returns the current active or betting round with all its placed bets' })
  @ApiResponse({ status: 200, description: 'Current round data', type: CurrentRoundResponseDto })
  @ApiResponse({ status: 204, description: 'No active round' })
  async getCurrentRound(): Promise<CurrentRoundResponseDto | null> {
    const round = await this.roundRepository.findCurrent();
    if (!round) return null;

    const bets = await this.betRepository.findByRoundId(round.id);

    return {
      id: round.id,
      status: round.status,
      hash: round.hash,
      startedAt: round.startedAt,
      bets: bets.map(b => ({
        id: b.id,
        keycloakId: b.keycloakId,
        amount: b.amount.toString(),
        status: b.status,
        cashoutMultiplier: b.cashoutMultiplier
      }))
    };
  }

  @Get('rounds/history')
  @ApiOperation({ summary: 'Get rounds history', description: 'Returns a list of recently finished rounds' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of rounds to return (default: 20)' })
  @ApiResponse({ status: 200, description: 'List of finished rounds', type: [RoundHistoryResponseDto] })
  async getHistory(@Query('limit') limit = 20): Promise<RoundHistoryResponseDto[]> {
    const rounds = await this.roundRepository.findHistory(Number(limit));

    return rounds.map(round => ({
      id: round.id,
      crashPoint: round.crashPoint,
      hash: round.hash,
      seed: round.seed,
      finishedAt: round.finishedAt
    }));
  }

  @Get('rounds/:roundId/verify')
  @ApiOperation({ summary: 'Verify round fairness', description: 'Verifies the crash point of a finished round using the seed and hash' })
  @ApiResponse({ status: 200, description: 'Verification result', type: VerifyRoundResponseDto })
  @ApiResponse({ status: 400, description: 'Round not found or not finished' })
  async verifyRound(@Param('roundId') roundId: string): Promise<VerifyRoundResponseDto> {
    const round = await this.roundRepository.findById(roundId);
    if (!round) throw new BadRequestException("Round not found");

    if (round.status !== 'FINISHED') throw new BadRequestException("Round is not finished");

    return {
      hash: round.hash,
      seed: round.seed,
      crashPoint: round.crashPoint,
      isValid: this.provablyFairService.verifyCrashPoint(round.seed, round.hash)
    };
  }

  @Get('bets/me')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my bets', description: 'Returns the bet history for the authenticated user' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of bets to return (default: 20)' })
  @ApiResponse({ status: 200, description: 'User bet history', type: [MyBetResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyBets(@CurrentUser() user: JwtPayload, @Query('limit') limit = 20): Promise<MyBetResponseDto[]> {
    const bets = await this.betRepository.findHistoryByKeycloakId(user.sub, Number(limit));

    return bets.map(b => ({
      id: b.id,
      roundId: b.roundId,
      amount: b.amount.toString(),
      status: b.status,
      cashoutMultiplier: b.cashoutMultiplier,
      createdAt: b.createdAt,
      round: b.round ? {
        crashPoint: b.round.crashPoint
      } : null
    }));
  }

  @Post('bet')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bet', description: 'Places a bet on the current betting round' })
  @ApiBody({ type: PlaceBetDto })
  @ApiResponse({ status: 201, description: 'Bet placed successfully', type: SuccessResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid amount, no active round, or already bet' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async placeBet(@CurrentUser() user: JwtPayload, @Body() body: PlaceBetDto): Promise<SuccessResponseDto> {
    await this.placeBetUseCase.execute({
      keycloakId: user.sub,
      amount: body.amount,
      autoCashoutMultiplier: body.autoCashoutMultiplier
    });

    return { success: true };
  }

  @Post('bet/cashout')
  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cashout', description: 'Cashes out the current bet before the round crashes' })
  @ApiResponse({ status: 201, description: 'Cashout successful', type: SuccessResponseDto })
  @ApiResponse({ status: 400, description: 'No active round, bet not found, or round already crashed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cashout(@CurrentUser() user: JwtPayload): Promise<SuccessResponseDto> {
    await this.cashoutUseCase.execute({
      keycloakId: user.sub
    });

    return { success: true };
  }
}
