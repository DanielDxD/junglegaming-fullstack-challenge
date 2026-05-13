import { ApiProperty } from "@nestjs/swagger"

export class WalletResponse {
    @ApiProperty({ example: "01KRFD0H7MFWRRCWEXT6330ZE7" })
    public readonly id: string

    @ApiProperty({ example: "93ec7e0f-24b2-4f38-96ff-a77c358e4a15" })
    public readonly keycloakId: string

    @ApiProperty({ example: "95000" })
    public balance: bigint

    @ApiProperty({ example: "2022-01-01T00:00:00.000Z" })
    public readonly createdAt: Date

    @ApiProperty({ example: "2022-01-01T00:00:00.000Z" })
    public readonly updatedAt: Date
}