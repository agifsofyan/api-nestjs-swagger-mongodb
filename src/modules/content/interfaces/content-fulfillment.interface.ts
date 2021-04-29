import { Document } from 'mongoose';

export interface IThanks extends Document {
     video: string;
     title: string;
     description: string;
}

export interface IModule extends Document {
     statement: [{ value: string }]; //statement
     question: [{ value: string }];
     mission: [{ value: string }];
     mind_map: [{ value: string }];
}

export interface IFulfillment extends Document {
     isBlog: boolean; // type
     product: string;
     thanks: IThanks;
     goal: string;
     module?: IModule;
     title?: string;
     topic?: [any];
     images?: [string];
     desc?: string;
     podcast?: [{ 
          url: string,
          title: string
     }];
     video?: [any];
     webinar?: [any]; 
     author: any;
     placement?: string; // enum: [spotlight, stories] // checklist
     post_type?: string; // enum: [webinar, video, tips] // checklist
}
