import { ApiProperty } from "@nestjs/swagger";

export class SuccessResponseDto {
  @ApiProperty({ example: true, description: "Indicates whether the operation was successful" })
  success: boolean;
}
