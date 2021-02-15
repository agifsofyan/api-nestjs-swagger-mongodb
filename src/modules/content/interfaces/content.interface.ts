import { Document } from 'mongoose';

export interface IAnswer extends Document {
     answer: string;
     answer_by: string;
     answer_date: string;
     mission_complete: string;
}

export interface IModule extends Document {
     statement: string; //statement
     question: string;
     mission: string;
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
     tag: [string]; // from tag name to tag ID 
     author: any;
     created_at: string;
     placement: string; // enum: [spotlight, stories] // checklist
     series: string;
}
