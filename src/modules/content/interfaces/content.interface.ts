import { Document } from 'mongoose';

export interface IAnswer extends Document {
     answer: string;
     answer_by: string;
     answer_date: string;
     mission_complete: string;
}

export interface IModule extends Document {
     statement_list: string; //statement
     question_list: string;
     mission_list: string;
     mind_map: [string];
     answers: IAnswer;
}

export interface IContent extends Document {
     isBlog: boolean; // type
     product: any; //fulfillment
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
     series: string;
}
