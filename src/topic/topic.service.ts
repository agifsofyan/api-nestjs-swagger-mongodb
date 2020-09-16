import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ITopic } from './interfaces/topic.interface';
import { OptQuery } from '../utils/optquery';

@Injectable()
export class TopicService {
    constructor(@InjectModel('Topic') private topicModel: Model<ITopic>) {}

    async findAll(options: OptQuery): Promise<ITopic> {
        const { offset, limit, fields, sortby, sortval, value } = options;

		const offsets = (offset == 0 ? offset : (offset - 1));
		const skip = offsets * limit;
		const sortvals = (sortval == 'asc') ? 1 : -1;

		if (sortby) {
			if (fields) {
				return await this.topicModel
					.find({ $where: `/^${value}.*/.test(this.${fields})` })
					.skip(Number(skip))
					.limit(Number(limit))
					.sort({ [sortby]: sortvals })
					.exec();
			} else {
				return await this.topicModel
					.find()
					.skip(Number(skip))
					.limit(Number(limit))
					.sort({ [sortby]: sortvals })
					.exec();
			}
		} else {
			if (fields) {
				return await this.topicModel
					.find({ $where: `/^${value}.*/.test(this.${fields})` })
					.skip(Number(skip))
					.limit(Number(limit))
					.exec();
			} else {
				return await this.topicModel
					.find()
					.skip(Number(skip))
					.limit(Number(limit))
					.exec();
			}
		}
    }
    
    async findById(id: string): Promise<ITopic> {
		const topic = await this.topicModel.findById(id);
		if (!topic) {
			throw new NotFoundException('Topic does not exist.');
		}
		return topic;
    }
}
