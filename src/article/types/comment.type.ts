import { CommentEntity } from '../comment.entity';

export type CommentType = Omit<CommentEntity, 'updateTimestamp'>;
