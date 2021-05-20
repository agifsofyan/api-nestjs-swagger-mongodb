import { Document } from 'mongoose';

export interface IThanks extends Document {
     video: string;
     title: string;
     description: string;
}

export interface IModule extends Document {
     statement: [{ value: string }]; //statement
     question: [{ value: string, answers: [{ answer: String, user: String, datetime: Date }] }];
     mission: [{ value: string, completed: [{ user: String, datetime: Date }] }];
     mind_map: [{ value: string }];
     author: string;
}

export interface IPost extends Document {
     topic: string;
     title: string;
     images: string;
     post_type: string;
     placement: string;
     podcast: any;
     webinar: any;
     video: any;
     tips: string;
     author: string;
}

export interface IFulfillment extends Document {
     product: string;
     thanks: IThanks;
     goal: string;
     module: IModule;
     title: string;
     post: IPost[];
}