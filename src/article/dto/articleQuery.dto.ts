import { ApiPropertyOptional } from "@nestjs/swagger";

export class ArticleQueryDto {
    @ApiPropertyOptional()
    readonly limit?: number

    @ApiPropertyOptional()
    readonly offset?: number

    @ApiPropertyOptional()
    readonly tag?: string

    @ApiPropertyOptional()
    readonly author?: string

    @ApiPropertyOptional()
    readonly favorited?: string
}