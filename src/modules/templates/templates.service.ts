import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITemplate } from './interfaces/templates.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { MailService } from '../mail/mail.service';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
        private readonly mailService: MailService
    ) {}

    async create(userId: string, input: any): Promise<ITemplate> {
        // Check if topic name is already exist
        const isNameExist = await this.templateModel.findOne({ name: input.name });
        
		if (isNameExist) {
            throw new BadRequestException('That name is already exist.');
		}
        
		input.by = userId
        
        if(input.type === 'MAIL'){
            await this.mailService.createTemplate(userId, input)
        }

        const query = new this.templateModel(input);
        return await query.save();
	}

	async findAll(options: OptQuery): Promise<ITemplate[]> {
		const offset = (options.offset == 0 ? options.offset : (options.offset - 1));
		const skip = offset * options.limit;
		const sortval = (options.sortval == 'asc') ? 1 : -1;

		if (options.sortby){
			if (options.fields) {

				return await this.templateModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })

			} else {

				return await this.templateModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ [options.sortby]: sortval })

			}
		}else{
			if (options.fields) {

				return await this.templateModel
					.find({ $where: `/^${options.value}.*/.test(this.${options.fields})` })
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })

			} else {

				return await this.templateModel
					.find()
					.skip(Number(skip))
					.limit(Number(options.limit))
					.sort({ 'updated_at': 'desc' })

			}
		}
	}

	async findByName(name: string): Promise<ITemplate> {
	 	let result;
		try{
		    result = await this.templateModel.findOne({name:name})
		}catch(error){
		    throw new NotFoundException(`Could nod find template with name ${name}`);
		}

		if(!result){
			throw new NotFoundException(`Could nod find template with name ${name}`);
		}

		return result;
	}

	async update(userId: string, name: string, description: any): Promise<ITemplate> {
		let result;
		
		// Check ID
		try{
		    result = await this.templateModel.findOne({name:name});
		}catch(error){
		    throw new NotFoundException(`Could not find template with name ${name}`);
		}

		if(!result){
			throw new NotFoundException(`Could not find template with name ${name}`);
        }
        
        const input = {
            description: description.description,
            by: userId
        }

		try {
            if(result.type === 'MAIL'){
                await this.mailService.updateTemplate(userId, name, description)
            }

			await this.templateModel.findOneAndUpdate({name:name}, input);
			return await this.templateModel.findOne({name:name});
		} catch (error) {
			throw new Error(error)
		}
	}

	async delete(name: string) {
        let result;
		
		// Check ID
		try{
		    result = await this.templateModel.findOne({name:name});
		}catch(error){
		    throw new NotFoundException(`Could not find template with name ${name}`);
		}

		if(!result){
			throw new NotFoundException(`Could not find template with name ${name}`);
        }

		try{
            if(result.type === 'MAIL'){
                await this.mailService.dropTemplate(name)
            }

			await this.templateModel.findOneAndRemove({name:name});
		}catch(err){
			throw new NotImplementedException('The template could not be deleted');
		}
	}
}
