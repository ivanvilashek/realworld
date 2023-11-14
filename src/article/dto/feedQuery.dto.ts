import { PickType } from '@nestjs/swagger';
import { ArticleQueryDto } from './articleQuery.dto';

export class FeedQueryDto extends PickType(ArticleQueryDto, [
  'limit',
  'offset',
]) {}
