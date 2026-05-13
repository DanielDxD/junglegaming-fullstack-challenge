import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CurrentRoundBetDto {
  @ApiProperty({ example: "01HVKZV8Q5QY5XYZ1234567890", description: "The bet ID" })
  id: string;

  @ApiProperty({ example: "user-1234-5678-abcd", description: "The Keycloak user ID of the bettor" })
  keycloakId: string;

  @ApiProperty({ example: "1000", description: "The bet amount in cents (e.g., 1000 = 10.00)" })
  amount: string;

  @ApiProperty({ example: "PENDING", description: "The status of the bet", enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WON', 'LOST'] })
  status: string;

  @ApiPropertyOptional({ example: 1.5, description: "The multiplier at which the user cashed out, if applicable" })
  cashoutMultiplier: number | null;
}

export class CurrentRoundResponseDto {
  @ApiProperty({ example: "01HVKZV8Q5QY5XYZ1234567890", description: "The round ID" })
  id: string;

  @ApiProperty({ example: "BETTING", description: "The status of the round", enum: ['PENDING', 'BETTING', 'ACTIVE', 'FINISHED'] })
  status: string;

  @ApiProperty({ example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", description: "The hashed seed of the round" })
  hash: string;

  @ApiPropertyOptional({ example: "2023-10-10T14:48:00.000Z", description: "When the round started its ACTIVE phase" })
  startedAt: Date | null;

  @ApiProperty({ type: [CurrentRoundBetDto], description: "List of bets placed in this round" })
  bets: CurrentRoundBetDto[];
}
