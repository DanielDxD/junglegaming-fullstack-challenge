import { ApiProperty } from "@nestjs/swagger";

export class VerifyRoundResponseDto {
  @ApiProperty({ example: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", description: "The hashed seed of the round" })
  hash: string;

  @ApiProperty({ example: "random-server-seed-value", description: "The unhashed seed of the round (revealed after crash)" })
  seed: string;

  @ApiProperty({ example: 2.35, description: "The crash point of the round" })
  crashPoint: number | null;

  @ApiProperty({ example: true, description: "Whether the round is valid according to the Provably Fair algorithm" })
  isValid: boolean;
}
