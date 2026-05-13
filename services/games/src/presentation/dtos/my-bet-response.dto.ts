import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class MyBetRoundDto {
  @ApiPropertyOptional({ example: 2.35, description: "The crash point of the round" })
  crashPoint: number | null;
}

export class MyBetResponseDto {
  @ApiProperty({ example: "01HVKZV8Q5QY5XYZ1234567890", description: "The bet ID" })
  id: string;

  @ApiProperty({ example: "01HVKZV8Q5QY5XYZ1234567890", description: "The round ID" })
  roundId: string;

  @ApiProperty({ example: "1000", description: "The bet amount in cents" })
  amount: string;

  @ApiProperty({ example: "WON", description: "The status of the bet", enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WON', 'LOST'] })
  status: string;

  @ApiPropertyOptional({ example: 1.5, description: "The multiplier at which the user cashed out, if applicable" })
  cashoutMultiplier: number | null;

  @ApiProperty({ example: "2023-10-10T14:48:00.000Z", description: "When the bet was placed" })
  createdAt: Date;

  @ApiPropertyOptional({ type: MyBetRoundDto, description: "Information about the round" })
  round: MyBetRoundDto | null;
}
