import { Document } from 'mongoose';

export interface IFollowUp extends Document {
     user: string;
     order: string;
     activity: [{
          message: string,
          agent: string, // Nama Sales/Agent
          date: Date,
          next: boolean,
          is_done: boolean
     }];
     is_complete: boolean;
}
