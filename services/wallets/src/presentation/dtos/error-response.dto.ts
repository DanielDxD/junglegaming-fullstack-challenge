import { ApiProperty } from "@nestjs/swagger"

export class ErrorResponse {
    @ApiProperty({ example: "An error ocurred" })
    public message: string

    @ApiProperty({ example: "Not found" })
    public error: string

    @ApiProperty({ example: 404 })
    public statusCode: number
}