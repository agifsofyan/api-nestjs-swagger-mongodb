import { Document } from 'mongoose';

export interface IMedia extends Document {
    filename: string;
    path: string;
    url: string;
    filetype: string;
    mimetype: string;
    created_at: Date;
    sub_path: string;
}
