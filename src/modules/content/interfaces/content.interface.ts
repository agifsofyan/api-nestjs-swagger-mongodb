import { Document } from 'mongoose';

export interface IAnswer extends Document {
     answer: string;
     answer_by: string;
     mission_done: boolean;
}

export interface IModule extends Document {
     action_list: string; //statement
     question_list: string;
     mission_list: string;
     mind_map: [string];
     answers: IAnswer[];
}

export interface IContent extends Document {
     isBlog: boolean; // type
     product: [any]; //fulfillment
     topic: [any];
     title: string;
     desc: string;
     images: [string];
     module : IModule[];
     podcast: [{ url: string }];
     video: [{ url: string }];
     tag: [any];
     author: any;
     created_at: string;
     placement: string; // enum: [spotlight, stories] // checklist
}
