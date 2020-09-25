import { 
    Controller,
    Get,
    Param,
    Post,
    Req
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { TopicService } from './topic.service';

@ApiTags('Topics')
@Controller('topics')
export class TopicController {
    constructor(private topicService: TopicService) {}

    /**
     * @route   POST api/v1/topics
     * @desc    Get all topic
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'Get all topic (query: optional)' })
    @ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})
	@ApiQuery({ 
		name: 'offset', 
		required: false, 
		explode: true, 
		type: Number, 
		isArray: false 
	})
    async getAllTopics(@Req() req: FastifyRequest) {
        return await this.topicService.findAll(req.query);
    }

    /**
	 * @route    Get /api/v1/topics/:id
	 * @desc     Get topic by id
	 * @access   Public
	 */
	@Get(':slug')
	@ApiOperation({ summary: 'Get topic by slug' })
	async getTopicBySlug(@Param('slug') slug: string)  {
		return await this.topicService.findTopicBySlug(slug);
	}
}
