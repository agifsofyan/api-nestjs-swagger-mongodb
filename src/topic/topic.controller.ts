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

import { TopicService } from './topic.service';

@ApiTags('Topics')
@Controller('topics')
export class TopicController {
    constructor(private topicService: TopicService) {}

    /**
     * @route   POST api/v1/topics
     * @desc    Filter all topic
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'Filter all topic' })
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
    async filterTopics(@Req() req) {
        return await this.topicService.filter(req.query);
	}
	
	 /**
     * @route   GET api/v1/topics
     * @desc    Get all topic
     * @access  Public
     */
    @Get()
    @ApiOperation({ summary: 'Filter all topic' })
	async getAllTopics() {
		return await this.topicService.fetch();
	}

    /**
	 * @route    GET /api/v1/topics/:slug
	 * @desc     Get topic by slug
	 * @access   Public
	 */
	@Get(':slug')
	@ApiOperation({ summary: 'Get topic by slug' })
	async getTopicBySlug(@Param('slug') slug: string)  {
		return await this.topicService.find(slug);
	}
}
