import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { User } from '@app/user/decorators/user.decorator';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { DeleteResult } from 'typeorm';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CommentsResponseInterface } from './types/commentsResponse.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBasicAuth,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
  ApiQuery,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { ArticleQueryDto } from './dto/articleQuery.dto';
import { FeedQueryDto } from './dto/feedQuery.dto';
import { ArticleEntity } from './article.entity';

@ApiTags('Articles')
@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @ApiOperation({ summary: 'Get all articles', description: 'Optional auth' })
  @ApiResponse({ status: 200, description: 'Return all articles.' })
  @Get()
  async findAll(
    @User('id') userId: number,
    @Query() query: ArticleQueryDto,
  ): Promise<ArticlesResponseInterface> {
    return this.articleService.findAll(userId, query);
  }

  @ApiOperation({ summary: 'Get article feed' })
  @ApiBasicAuth()
  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') userId: number,
    @Query() query: FeedQueryDto,
  ): Promise<ArticlesResponseInterface> {
    return this.articleService.getFeed(userId, query);
  }

  @ApiOperation({ summary: 'Create article' })
  @ApiExtraModels(CreateArticleDto, ArticleEntity)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        article: {
          $ref: getSchemaPath(CreateArticleDto),
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created',
    type: ArticleEntity,
  })
  @ApiBasicAuth()
  @Post()
  @UsePipes(new BackendValidationPipe())
  @UseGuards(AuthGuard)
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @ApiOperation({ summary: 'Get single article' })
  @Get(':slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.getArticleBySlug(slug);
    return this.articleService.buildArticleResponse(article);
  }

  @ApiOperation({ summary: 'Delete article' })
  @ApiBasicAuth()
  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<DeleteResult> {
    return await this.articleService.deleteArticle(slug, userId);
  }

  @ApiOperation({ summary: 'Update article' })
  @ApiBasicAuth()
  @ApiExtraModels(UpdateArticleDto)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        article: {
          $ref: getSchemaPath(UpdateArticleDto),
        },
      },
    },
  })
  @Put(':slug')
  @UsePipes(BackendValidationPipe)
  @UseGuards(AuthGuard)
  async updateArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(
      slug,
      updateArticleDto,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @ApiOperation({ summary: 'Create comment' })
  @ApiBasicAuth()
  @ApiExtraModels(CreateCommentDto)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comment: {
          $ref: getSchemaPath(CreateCommentDto),
        },
      },
    },
  })
  @Post(':slug/comments')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async addCommentToArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Body('comment') createCommenDto: CreateCommentDto,
  ): Promise<CommentResponseInterface> {
    const comment = await this.articleService.addCommentToArticle(
      slug,
      user,
      createCommenDto,
    );

    return this.articleService.buildCommentResponse(comment);
  }

  @ApiOperation({ summary: 'Get comments' })
  @ApiBasicAuth()
  @Get(':slug/comments')
  @UseGuards(AuthGuard)
  async getCommentsFromArticle(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<CommentsResponseInterface> {
    return this.articleService.getCommentsFromArticle(slug, userId);
  }

  @ApiOperation({ summary: 'Delete article' })
  @ApiBasicAuth()
  @Delete(':slug/comments/:id')
  @UseGuards(AuthGuard)
  async deleteComment(
    @User('id') userId: number,
    @Param('slug') slug: string,
    @Param('id') commentId: number,
  ): Promise<DeleteResult> {
    return this.articleService.deleteComment(slug, userId, commentId);
  }

  @ApiOperation({ summary: 'Favorite article' })
  @ApiBasicAuth()
  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }

  @ApiOperation({ summary: 'Unfavorite article' })
  @ApiBasicAuth()
  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(
    @User('id') userId: number,
    @Param('slug') slug: string,
  ): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(
      slug,
      userId,
    );
    return this.articleService.buildArticleResponse(article);
  }
}
