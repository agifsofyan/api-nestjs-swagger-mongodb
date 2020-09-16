import { 
    Controller,
    Get,
    Param,
    Post,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';

import { OptQuery } from '../utils/optquery';

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
    async getAllTopics(@Query() query: OptQuery) {
        return await this.topicService.findAll(query);
    }

    /**
	 * @route    Get /api/v1/topics/:id
	 * @desc     Get topic by id
	 * @access   Public
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get topic by id' })
	async findById(@Param('id') id: string)  {
		return await this.topicService.findById(id);
	}
}
