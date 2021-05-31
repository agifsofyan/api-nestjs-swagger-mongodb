import { Document } from 'mongoose';

export interface IThanks extends Document {
     video: string;
     title: string;
     description: string;
}

export interface IModule extends Document {
     statement: [{ value: string }]; //statement
     question: [{ value: string, answers: [{ answer: String, user: String, datetime: Date }] }];
     mission: [{ value: string, completed: [{ user: String, datetime: Date }] }];
     mind_map: [{ value: string }];
     author: string;
}

export interface IPost extends Document {
     topic: string;
     title: string;
     desc: string;
     images: string;
     post_type: string;
     placement: string;
     podcast: object;
     webinar: string;
     video: string;
     tips: string;
     author: string;
     postdate: Date;
}

export interface IFulfillment extends Document {
     product: string;
     thanks: IThanks;
     goal: string;
     module: IModule;
     post: [{
	topic: string,
     	title: string,
     	desc: string,
     	images: string,
     	post_type: string,
     	placement: string,
     	podcast: any,
     	webinar: string,
     	video: string,
     	tips: string,
     	author: string
     }];
}
