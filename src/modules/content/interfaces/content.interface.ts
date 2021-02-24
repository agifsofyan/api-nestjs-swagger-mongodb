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

export interface IProduct extends Document {
     _id: string;
     type: string; // ['boe', 'ecommerce','ecourse', 'bonus']
}

export interface IThanks extends Document {
     video: string;
     title: string;
     description: string;
}

export interface IMentor extends Document {
     _id: string;
}

export interface IContent extends Document {
     isBlog: boolean; // type
     product: IProduct;
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
     podcast: [{ url: string }];
     video: [{ url: string }];
     tag: [string]; // from tag name to tag ID 
     author: any;
     thanks: IThanks;
     mentor: IMentor;
     placement: string; // enum: [spotlight, stories] // checklist
     post_type: string; // enum: [webinar, video, tips] // checklist
     series: boolean;
}
