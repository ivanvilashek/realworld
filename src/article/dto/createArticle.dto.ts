import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly body: string;
  
  @ApiProperty()
  @IsNotEmpty()
  readonly description: string;
  
  @ApiPropertyOptional()
  readonly tagList?: string[];
}
