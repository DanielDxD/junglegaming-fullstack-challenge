import { ApiProperty } from "@nestjs/swagger";

export class HealthCheckResponseDto {
  @ApiProperty({ example: "ok", description: "Health status of the service" })
  status: string;

  @ApiProperty({ example: "games", description: "Name of the service" })
  service: string;
}
