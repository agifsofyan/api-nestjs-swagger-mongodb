import { Document } from 'mongoose';

export interface IContent extends Document {
     name: string;
     isBlog: boolean;
     cover_img: string;
     product: [any];
     topic: [any];
     content: string;
     images: [string];
     module : [{ question: String }],
     podcast: [{ url: String }]
     video: [{ url: String }]
     tag: [string]
}
