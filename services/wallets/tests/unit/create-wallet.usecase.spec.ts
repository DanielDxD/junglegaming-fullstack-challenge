import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";
import { CreateWalletUseCase } from "../../src/application/usecases/create-wallet.usecase";
import { WalletRepository } from "../../src/domain/repositories/wallet.repository";
import { Wallet } from "../../src/domain/entities/wallet.entity";
import { ConflictException } from "@nestjs/common";

type MockWalletRepository = {
  create: Mock<WalletRepository["create"]>;
  findByKeycloakId: Mock<WalletRepository["findByKeycloakId"]>;
};

describe("CreateWalletUseCase", () => {
  let useCase: CreateWalletUseCase;
  let mockWalletRepository: MockWalletRepository;

  beforeEach(() => {
    mockWalletRepository = {
      create: mock(),
      findByKeycloakId: mock(),
    };
    useCase = new CreateWalletUseCase(mockWalletRepository as unknown as WalletRepository);
  });

  it("should create a wallet successfully", async () => {
    const keycloakId = "user-123";
    const newWallet = new Wallet("id-123", keycloakId, 0n, new Date(), new Date());

    mockWalletRepository.findByKeycloakId.mockResolvedValue(null);
    mockWalletRepository.create.mockResolvedValue(newWallet);

    const result = await useCase.execute(keycloakId);

    expect(result).toBe(newWallet);
    expect(mockWalletRepository.findByKeycloakId).toHaveBeenCalledWith(keycloakId);
    expect(mockWalletRepository.create).toHaveBeenCalled();
  });

  it("should throw ConflictException if wallet already exists", async () => {
    const keycloakId = "user-123";
    const existingWallet = new Wallet("id-123", keycloakId, 0n, new Date(), new Date());

    mockWalletRepository.findByKeycloakId.mockResolvedValue(existingWallet);

    expect(useCase.execute(keycloakId)).rejects.toThrow(ConflictException);
    expect(mockWalletRepository.findByKeycloakId).toHaveBeenCalledWith(keycloakId);
    expect(mockWalletRepository.create).not.toHaveBeenCalled();
  });
});
