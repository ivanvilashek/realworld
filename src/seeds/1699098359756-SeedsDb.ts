import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1699098359756 implements MigrationInterface {
  name = 'SeedDb1699098359756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'),('coffee'),('nestjs')`,
    );

    //Password: 123
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('test','test@test.com','$2b$10$xLHI7dDCjurTMW9XOMsNnOT1PfQufcmZUpa1PWz5E/p27EqPh0EwG')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article','First article', 'First article desc', 'First article body', 'coffee, dragons',1)`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article','Second article', 'Second article desc', 'Second article body', 'coffee, dragons',1)`,
    );
  }

  public async down(): Promise<void> {}
}
