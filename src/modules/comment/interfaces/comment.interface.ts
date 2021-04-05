import { Document } from 'mongoose';

export interface ILike extends Document {
     liked_by: string;
}

export interface IReaction extends Document {
     user: string;
     comment: string;
     removed: {
          author: string,
          deleted_at: Date,
     };
     reactions: IReaction[];
     likes: ILike[];
     created_at: Date;
     updated_at: Date;
}

export interface IComment extends Document {
     product: string;
     user: string;
     comment: string;
     removed: {
          author: string,
          deleted_at: Date,
     };
     reactions: IReaction[];
     likes: ILike[];
     created_at: Date;
     updated_at: Date;
}

// export interface IComments extends Document {
//      product_id: string;
//      comments: IComment[]
// }
