import { Document } from 'mongoose';

export interface IFollowUp extends Document {
     user: string;
     agent : string; // Nama Sales/Agent
     order: string;
     address: string;
     activity: [{
          message: string,
          date: Date,
          is_active: boolean,
          is_done: boolean
     }],
     is_complete: boolean
}
