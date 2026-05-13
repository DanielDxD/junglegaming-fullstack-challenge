import { describe, it, expect, mock, beforeEach, Mock } from "bun:test";
import { GetWalletUseCase } from "../../src/application/usecases/get-wallet.usecase";
import { WalletRepository } from "../../src/domain/repositories/wallet.repository";
import { Wallet } from "../../src/domain/entities/wallet.entity";
import { NotFoundException } from "@nestjs/common";

type MockWalletRepository = {
  create: Mock<WalletRepository["create"]>;
  findByKeycloakId: Mock<WalletRepository["findByKeycloakId"]>;
};

describe("GetWalletUseCase", () => {
  let useCase: GetWalletUseCase;
  let mockWalletRepository: MockWalletRepository;

  beforeEach(() => {
    mockWalletRepository = {
      create: mock(),
      findByKeycloakId: mock(),
    };
    useCase = new GetWalletUseCase(mockWalletRepository as unknown as WalletRepository);
  });

  it("should get a wallet successfully", async () => {
    const keycloakId = "user-123";
    const wallet = new Wallet("id-123", keycloakId, 0n, new Date(), new Date());

    mockWalletRepository.findByKeycloakId.mockResolvedValue(wallet);

    const result = await useCase.execute(keycloakId);

    expect(result).toBe(wallet);
    expect(mockWalletRepository.findByKeycloakId).toHaveBeenCalledWith(keycloakId);
  });

  it("should throw NotFoundException if wallet does not exist", async () => {
    const keycloakId = "user-123";

    mockWalletRepository.findByKeycloakId.mockResolvedValue(null);

    expect(useCase.execute(keycloakId)).rejects.toThrow(NotFoundException);
    expect(mockWalletRepository.findByKeycloakId).toHaveBeenCalledWith(keycloakId);
  });
});
