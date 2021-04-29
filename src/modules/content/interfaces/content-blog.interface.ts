import { Document } from 'mongoose';

export interface IBlog extends Document {
     isBlog: boolean; // type
     topic: [any];
     title: string;
     desc: string;
     images: [string];
     podcast: [{ 
          url: string,
          title: string
     }];
     video: [any];
     author: string;
     placement: string; // enum: [spotlight, stories] // checklist
}
