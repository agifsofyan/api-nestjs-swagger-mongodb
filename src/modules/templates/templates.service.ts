import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException, 
	InternalServerErrorException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITemplate } from './interfaces/templates.interface';
import { OptQuery } from 'src/utils/OptQuery';
import { MailService } from '../mail/mail.service';
import { checkSpace } from 'src/utils/CustomValidation';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>,
        private readonly mailService: MailService
    ) {}

    async create(input: any): Promise<ITemplate> {
		const name = checkSpace(input.name)
        if(name){
            throw new BadRequestException("Template.name is missing. Don't use whitespace")
		}
		
        // Check if topic name is already exist
        const isNameExist = await this.templateModel.findOne({ name: input.name });
        
		if (isNameExist) {
            throw new BadRequestException('That name is already exist.');
		}

		const body = {
			...input,
			versions: [{
				template: input.template
			}]
		}
		const query = new this.templateModel(body);
        
        if(input.type === 'MAIL'){
			await this.mailService.createTemplate(input)
			return query
        }

        return await query.save();
	}

	async findAll(options: OptQuery): Promise<ITemplate[]> {
		var match = {}

		if (options.fields){
			
			if(options.value === 'true'){
			   options.value = true
			}

			if(options.value === 'false'){
			   options.value = false
			}

			match = { [options.fields]: options.value }
		}

		var query = await this.templateModel.aggregate([
			{
				$match: match
			}
		])

		return query
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

	async update(name: string, input: any): Promise<ITemplate> {
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
        
        const data = {
            description: input.description,
            by: input.by
        }

		try {
            if(result.type === 'MAIL'){
                await this.mailService.updateTemplate(name, input)
				return await this.templateModel.findOne({name:name});
            }else{
				await this.templateModel.findOneAndUpdate({name:name}, data);
				return await this.templateModel.findOne({name:name});
			}
		} catch (error) {
			throw new BadRequestException
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
            }else{
				await this.templateModel.findOneAndRemove({name:name});
			}
		}catch(err){
			throw new NotImplementedException('The template could not be deleted');
		}
	}

	// Versioning
	async getTemplatesVersion(template_name: string) {
        try {
            return await this.templateModel.findOne({name: template_name})
        } catch (error) {
            throw new BadRequestException
        }
    }

	async newTemplatesVersion(template_name: string, input: any) {
        const tag = checkSpace(input.name)
        if(tag){
            throw new BadRequestException("tag is missing. Don't use whitespace")
        }

		input.engine = "handlebars"
		var active = true
		if(!input.active || input.active == false || input.active === 'false'){
			active = false
		}

		input.active = active
        
        try {
			var mailer = await this.templateModel.findOne({name: template_name})

			if(!mailer) {
				throw new NotFoundException('template version not found')
			}

			if(mailer.type === 'MAIL'){
				return await this.mailService.newTemplatesVersion(template_name, input)
			}else{
				if(active === true){
					mailer.set(mailer.versions.map(mail => {
						mail.active = !active
						return mail
					}))
				}
	
				mailer.versions.push(input)
				mailer.save()
	
				return mailer
			}
        } catch (error) {
            throw new BadRequestException
        }
	}
	
	async updateTemplatesVersion(template_name: string, version_tag: string, input: any) {
		var mailer = await this.templateModel.findOne({name: template_name})
		if(!mailer) {
			throw new NotFoundException('template version not found')
		}

		var active = true
		if(!input.active){
			const getActive = mailer.versions.filter(t => t.tag = version_tag)

			console.log('mailer', mailer)
			active = getActive[0].active
		}

		if(input.active === false || input.active === 'false'){
			active = false
		}

		console.log('active', active)

		input.active = active
        
        try {
			// var mailer = await this.templateModel.findOneAndUpdate(
			// 	{name: template_name},
			// 	{$pull: { versions: { tag: version_tag } }},
			// 	{upsert: true, new: true}
			// )
			
			// if(mailer.type === 'MAIL'){
			// 	return await this.mailService.newTemplatesVersion(template_name, input)
			// }else{
				// if(active === true){
				// 	mailer.set(mailer.versions.map(mail => {
				// 		mail.active = !active
				// 		return mail
				// 	}))
				// }
	
				// mailer.versions.push(input)
				// mailer.save()
	
				return mailer
				// return null
			// }
        } catch (error) {
            throw new BadRequestException
        }
    }
}
