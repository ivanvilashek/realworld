import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@app/user/user.entity';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { FollowEntity } from './follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowEntity])],
  controllers: [ProfileController],
  providers: [ProfileService, AuthGuard],
  exports: [ProfileService],
})
export class ProfileModule {}
