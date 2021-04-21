import { Document } from 'mongoose';

export interface IStatement extends Document {
     value: string;
}

export interface IQuestion extends Document {
     value: string;
}

export interface IMission extends Document {
     value: string;
}

export interface IMindMap extends Document {
     value: string;
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
     module : {
          statement: IStatement[]; //statement
          question: IQuestion[];
          mission: IMission[];
          mind_map: IMindMap[];
     };
     podcast: [{ 
          url: string,
          title: string
     }];
     video: [any];
     //tag: [string]; // from tag name to tag ID 
     author: any;
     thanks: IThanks;
     mentor: string;
     placement: string; // enum: [spotlight, stories] // checklist
     post_type: string; // enum: [webinar, video, tips] // checklist
     // series: boolean;
     goal: string;
}
