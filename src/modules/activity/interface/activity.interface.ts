import { Document } from 'mongoose';

export interface IActivity extends Document {
    user: string;
    comment: string[];
    like: [{
        _id: string,
        kind: string
    }];
    share: string[];
    comment_reply: string[];
    review: string[];
    rating: string[];
    progress: [{
        _id: string,
        kind: string
        datetime: Date
    }];
}
