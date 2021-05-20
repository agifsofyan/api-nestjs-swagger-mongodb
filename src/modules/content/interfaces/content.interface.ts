import { Document } from 'mongoose';

export interface IModule extends Document {
     statement: [{ value: string }]; //statement
     question: [{ value: string, answers: [{ answer: String, user: String, datetime: Date }] }];
     mission: [{ value: string, completed: [{ user: String, datetime: Date }] }];
     mind_map: [{ value: string }];
}

export interface IThanks extends Document {
     video: string;
     title: string;
     description: string;
}

export interface IContent extends Document {
     isBlog: boolean; // type
     product: string;
     topic: [any];
     title: string;
     desc: string;
     images: [string];
     module : IModule;
     podcast: [{ 
          url: string,
          title: string
     }];
     video: [any];
     webinar: [any];
     //tag: [string]; // from tag name to tag ID 
     author: any;
     thanks: IThanks;
     mentor: string;
     placement: string; // enum: [spotlight, stories] // checklist
     post_type: string; // enum: [webinar, video, tips] // checklist
     // series: boolean;
     goal: string;
}
