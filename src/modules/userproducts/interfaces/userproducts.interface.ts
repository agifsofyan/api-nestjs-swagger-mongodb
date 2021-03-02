import { Document } from 'mongoose';

export interface IAnswer extends Document {
    question_id: string;
    answer: string;
}

export interface IMission extends Document {
    mission_id: string;
    done: boolean;
}

export interface IUserProducts extends Document {
    user_id: string;
    product_id: string;
    product_type: string;
	content_id: string;
	content_type: string; // fulfilment | blog
 	content_kind: string; // webinar | video | tips
    content_placement: string; // strories | spotlight
    topic: string[];
    progress: number;
    order_invoice: string;
    expired_date: string;
    utm: string;
    modules: {
        answers: IAnswer[];
        mission_complete: IMission[];
    };
}
