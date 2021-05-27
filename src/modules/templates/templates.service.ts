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
import { checkSpace } from 'src/utils/CustomValidation';

@Injectable()
export class TemplatesService {
    constructor(
        @InjectModel('Template') private readonly templateModel: Model<ITemplate>
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
			{ $match: match },
			{ $lookup: {
            			from: 'administrators',
            			localField: 'by',
            			foreignField: '_id',
            			as: 'by'
        		}},
        		{ $unwind: {
            			path: '$by',
            			preserveNullAndEmptyArrays: true
        		}},
        		{ $project: {
            			name:1,
            			description:1,
            			type:1,
            			"by._id":1,
            			"by.name":1,
            			"by.phone_number":1,
            			"versions.engine":1,
            			"versions.tag":1,
            			"versions.active":1,
            			"versions.createdAt":1,
            			createdAt:1
        		}}
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
			await this.templateModel.findOneAndUpdate({name:name}, data);
			return await this.templateModel.findOne({name:name});
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
            await this.templateModel.findOneAndRemove({name:name});
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
        
		var mailer = await this.templateModel.findOne({name: template_name})

		if(!mailer) {
			throw new NotFoundException('template version not found')
		}

		if(active === true){
			mailer.set(mailer.versions.map(mail => {
				mail.active = !active
				return mail
			}))
		}

		mailer.versions.push(input)
		mailer.save()

		return await this.templateModel.findOne({name: template_name})
	}
	
	async updateTemplatesVersion(template_name: string, version_tag: string, input: any) {
		var mailer = await this.templateModel.findOne({name: template_name})
		
		var activeVersion = mailer.versions.find(mail => mail.tag === version_tag)

		if(!mailer || !activeVersion) {
			throw new NotFoundException('template version not found')
		}
		
		input = {
			template: !input.template ? activeVersion.template : input.template,
			tag: !input.tag ? activeVersion.tag : input.tag,
			comment: !input.comment ? activeVersion.comment : input.comment,
			active: !input.active ? activeVersion.active : Boolean(input.active)
		}

		if(input.active && input.active !== activeVersion.active){
			await this.templateModel.findOneAndUpdate(
				{name: template_name},
				{$set: {
					'versions.$[].active': !input.active
				}}
			)
		}

		await this.templateModel.findOneAndUpdate(
			{name: template_name, "versions.tag": version_tag},
			{$set: { 'versions.$': input }},
			{upsert: true}
		)

		return await this.templateModel.findOne({name: template_name})
	}

	async dropTemplatesVersion(template_name: string, version_tag: string) {
		var mailer = await this.templateModel.findOne({name: template_name})

		await this.templateModel.findOneAndUpdate(
			{name: template_name, "versions.tag": version_tag},
			{$pull: { versions: { tag: version_tag } }},
			{upsert: true, new: true}
		)

		return await this.templateModel.findOne({name: template_name})
    }
}
