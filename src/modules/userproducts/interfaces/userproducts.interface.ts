import { Document } from 'mongoose';

export interface IAnswer extends Document {
    module_id: string;
    answer: string;
    answer_date: string;
    mission_complete: boolean;
}

export interface IUserProducts extends Document {
    user: string;
    product: string;
    product_type: string;
	content: string;
	content_type: string;
    topic: string[];
    progress: number;
    utm: string;
    expired_date: string;
    answers: IAnswer[];
}
