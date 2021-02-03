import { Document } from 'mongoose';

export interface ILike extends Document {
     liked_by: string;
}

export interface IComment extends Document {
     user_id: string;
     comment: string;
     datetime: string;
     author_id: string;
     // reactions: string;
     comment_parent_id: string;
     likes: ILike[];
}

export interface IComments extends Document {
     product_id: string,
     comments: IComment[]
}
