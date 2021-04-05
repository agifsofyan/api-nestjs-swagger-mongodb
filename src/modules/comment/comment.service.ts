import { 
	Injectable, 
	NotFoundException, 
	BadRequestException,
	NotImplementedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IComment } from './interfaces/comment.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CommentService {
    constructor(
		@InjectModel('Comment') private readonly commentModel: Model<IComment>
	) {}

    async newComment(product_id: string, input: any, user: any) {
        input.product = product_id
        input.user = user._id

        var comment = await this.commentModel.findOne({product: product_id, user: user._id})

        if(comment) {
            comment.comment = comment.comment + ". " + input.comment
            comment.updated_at = new Date()
        }else{
            comment = new this.commentModel(input)
        }

        await comment.save()

        return await this.commentModel.findOne({product: product_id, user: user._id})
    }

    async likeComment(comment_id: string, user: any) {
        const like:any = { liked_by: user._id }

        var comment = await this.commentModel.findById(comment_id)

        // if(!comment) throw new NotFoundException('comment not found');
        if(!comment){
            comment = await this.commentModel.findOne({'reactions.$._id': comment_id})
            console.log('comment reaction', comment)
        }
        
        const commentFind = comment.likes.find(val => val.liked_by == user._id.toString())

        if(commentFind){
            return { msg: 'already like this comment', comment }
        }else{
            comment.likes.push(like)
            await comment.save()

            return { msg: 'like this comment sucessfuly', comment: await this.commentModel.findById(comment_id) }
        }
    }

    async replyComment(comment_id: string, input: any, user: any) {
        input.user = user._id
        input.created_at = new Date()

        const comment = await this.commentModel.findById(comment_id)

        if(!comment) throw new NotFoundException('comment not found');

        comment.reactions.push(input)
        await comment.save()

        return await this.commentModel.findById(comment_id)
    }
}
