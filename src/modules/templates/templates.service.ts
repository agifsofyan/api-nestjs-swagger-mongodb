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
import { randThree } from 'src/utils/order';

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
		
		var active = mailer.versions.filter(mail => mail.tag === version_tag)
		
		if(!mailer || active.length === 0) {
			throw new NotFoundException('template version not found')
		}

		if(mailer.type === 'MAIL'){
			return await this.mailService.updateTemplatesVersion(template_name, version_tag, input)
		}else{
			if(!input.active){
				input.active = active[0].active
			}else{
				input.active = Boolean(input.active)
			}
	
			if(input.active && input.active !== active[0].active){
				await this.templateModel.findOneAndUpdate(
					{name: template_name, "versions.tag": version_tag},
					{$set: { 
						'versions.$[].active': !input.active
					}}
				)
			}
	
			await this.templateModel.findOneAndUpdate(
				{name: template_name, "versions.tag": version_tag},
				{$set: { 'versions.$': input }},
				{upsert: true, new: true}
			)
	
			return await this.templateModel.findOne({name: template_name})
		}
	}

	async dropTemplatesVersion(template_name: string, version_tag: string) {
        // try {
        //     const mailer = await mailgun.delete(`/${MAIL_GUN_DOMAIN}/templates/${template_name}/versions/${version_tag}`);
        //     return mailer
        // } catch (error) {
        //     throw new BadRequestException(error.code)
		// }
		
		var ttl_price = 100000
		let shipment_price = 50000
		// const rand = randThree()

		ttl_price += shipment_price + randThree()
		
		return ttl_price
    }
		
}
