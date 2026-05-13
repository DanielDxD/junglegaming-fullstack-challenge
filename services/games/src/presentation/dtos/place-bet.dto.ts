import { ApiProperty } from "@nestjs/swagger";

export class PlaceBetDto {
  @ApiProperty({ example: 1000, description: "The amount to bet in cents (e.g., 1000 = 10.00). Must be between 100 and 100000." })
  amount: number;

  @ApiProperty({ example: 2.0, description: "Target multiplier for automatic cashout.", required: false })
  autoCashoutMultiplier?: number;
}
