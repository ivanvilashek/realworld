import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { hash } from 'bcrypt';
import { ArticleEntity } from '@app/article/article.entity';
import { Exclude } from 'class-transformer';
import { CommentEntity } from '@app/article/comment.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @OneToMany(() => ArticleEntity, (acticle) => acticle.author)
  articles: ArticleEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: ArticleEntity[];

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];
}
