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
        var ID = comment_id
        const like:any = { liked_by: user._id }
        var react = false
        var comment:any = await this.commentModel.findById(comment_id)

        if(!comment){
            react = true
            comment = await this.commentModel.findOne({'reactions._id': comment_id}).then((val:any) => {
                ID = val._id
                if(val){
                    val = val.reactions.filter(res => res._id == comment_id)
                    return val[0]
                }
            })
        }

        if(!comment) throw new NotFoundException('comment not found');

        const reactions = comment.likes.filter((val) => {
            if(val){
                return val.liked_by == user._id.toString()
            }
        })

        var msg = 'already like this comment'
        const likes: any = { liked_by: user._id }

        if(react){
            if(reactions.length == 0) {   
                await this.commentModel.findOneAndUpdate(
                    { 'reactions._id': comment_id },
                    { $push: { 'reactions.$.likes': likes } },
                )
                
                msg = 'like this comment sucessfuly'
            }
        }else{
            if(reactions.length == 0) {
                comment.likes.push(like)
                await comment.save()
                
                msg = 'like this comment sucessfuly'
            }
        }

        return { msg: msg, comment: await this.commentModel.findById(ID) }
    }

    async replyComment(comment_id: string, input: any, user: any) {
        input.user = user._id
        input.created_at = new Date()

        var ID = comment_id
        var react = false
        var comment:any = await this.commentModel.findById(comment_id)

        console.log('comment-0',comment)

        if(!comment){
            react = true
            comment = await this.commentModel.findOne({'reactions._id': comment_id}).then((val:any) => {
                if(val) ID = val._id;
            })
        }

        if(!comment) throw new NotFoundException('comment not found');

        console.log('comment-2',comment)

        var msg = 'already like this comment'
        const reply: any = {
            _id: new ObjectId(),
            user: user._id,
            comment: input.comment,
            created_at: new Date()
        }

        if(react){
            await this.commentModel.findOneAndUpdate(
                { 'reactions._id': comment_id },
                { $push: { 'reactions.$.reactions': reply } },
            )
            
            msg = 'reply this comment sucessfuly'
        }else{
            comment.reactions.push(reply)
            await comment.save()
            
            msg = 'reply this comment sucessfuly'
        }

        return await this.commentModel.findById(ID)
    }
}
