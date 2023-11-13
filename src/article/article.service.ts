import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleEntity } from './article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeleteResult, Repository } from 'typeorm';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { FollowEntity } from '@app/profile/follow.entity';
import { CommentEntity } from './comment.entity';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CreateCommentDto } from './dto/createComment.dto';
import { ProfileService } from '@app/profile/profile.service';
import { CommentsResponseInterface } from './types/commentsResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    userId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.favorited) {
      const user = await this.userRepository.findOne({
        where: { username: query.author },
        relations: ['favorites'],
      });

      const ids = user.favorites.map((el) => el.id);

      if (ids.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    let favoriteIds: number[] = [];

    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favorites'],
      });
      favoriteIds = user.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorites, articlesCount };
  }

  async getFeed(
    userId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: { followerId: userId },
    });

    if (!follows.length) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserId = follows.map((follows) => follows.followingId);
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserId })
      .orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();
    return { articles, articlesCount };
  }

  async createArticle(
    user: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = user;

    return this.articleRepository.save(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async deleteArticle(slug: string, userId: number): Promise<DeleteResult> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== userId) {
      throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);
    if (updateArticleDto.title) {
      article.slug = this.getSlug(updateArticleDto.title);
    }

    return this.articleRepository.save(article);
  }

  async addCommentToArticle(
    slug: string,
    user: UserEntity,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentEntity> {
    const article = await this.getArticleBySlug(slug);
    const profile = await this.profileService.getProfile(
      user.id,
      user.username,
    );
    delete article.author;
    delete profile.email;
    const comment = new CommentEntity();
    Object.assign(comment, createCommentDto);
    comment.article = article;
    comment.author = profile;

    return this.commentRepository.save(comment);
  }

  async deleteComment(
    slug: string,
    userId: number,
    commentId: number,
  ): Promise<DeleteResult> {
    await this.getArticleBySlug(slug);
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (comment.author.id !== userId) {
      throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
    }

    return this.commentRepository.delete({ id: commentId });
  }

  async getCommentsFromArticle(
    slug: string,
    userId: number,
  ): Promise<CommentsResponseInterface> {
    const article = await this.getArticleBySlug(slug);
    const queryBuilder = this.dataSource
      .getRepository(CommentEntity)
      .createQueryBuilder('comments')
      .where('comments.articleId = :id', { id: article.id })
      .leftJoinAndSelect('comments.author', 'author')
      .orderBy('comments.createdAt', 'DESC');

    const followingUserIds: number[] = [];
    if (userId) {
      const follows = await this.followRepository.find({
        where: { followerId: userId },
      });
      followingUserIds.push(...follows.map((follows) => follows.followingId));
    }
    const comments = await queryBuilder.getMany();
    const updatedComments = comments.map((comment) => {
      const following = followingUserIds.includes(comment.author.id);
      return { ...comment, author: { ...comment.author, following } };
    });
    return { comments: updatedComments };
  }

  async addArticleToFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });
    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
    return { comment };
  }

  private getSlug(title: string): string {
    return `${slugify(title, { lower: true })}-${(
      (Math.random() * Math.pow(36, 6)) |
      0
    ).toString(36)}`;
  }
}
