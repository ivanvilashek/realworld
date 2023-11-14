import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArticleDto {
  @ApiPropertyOptional()
  readonly title: string;

  @ApiPropertyOptional()
  readonly body: string;

  @ApiPropertyOptional()
  readonly description: string;

  @ApiPropertyOptional()
  readonly tagList: string[];
}
