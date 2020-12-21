import { Document } from 'mongoose';

export interface IContent extends Document {
     name: string;
     isBlog: boolean;
     cover_img: string;
     product: [any];
     topic: [any];
     title: string;
     desc: string;
     images: [string];
     module : [{ question: string }];
     podcast: [{ url: string }];
     video: [{ url: string }];
     hashtag: [any];
     author: any;
     created_at: string;
}
