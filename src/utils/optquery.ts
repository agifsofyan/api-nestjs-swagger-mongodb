import { IsNumber, IsString } from 'class-validator';

export class OptQuery {
	@IsNumber()
	offset?: number;

	@IsNumber()
	limit?: number;
	
	@IsString()
	fields?: string;
	
	@IsString()
	value?: string;
	
	@IsString()
	sortby?: string;
	
	@IsString()
	sortval?: string;
}