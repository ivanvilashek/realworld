import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TagEntity } from './tag.entity';

@Module({
  controllers: [TagController],
  providers: [TagService],
  imports: [TypeOrmModule.forFeature([TagEntity])],
})
export class TagModule {}
