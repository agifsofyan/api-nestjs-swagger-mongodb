import { Document } from 'mongoose';

export interface IModule extends Document {
     statement: string; //statement
     question: string;
     mission: string;
     mind_map: [string];
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
