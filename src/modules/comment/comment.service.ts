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
            console.log('comment', comment)
            comment = await this.commentModel.findOne({'reactions._id': comment_id})
            .then((val:any) => {
                console.log('val-1', val)
                if(!val) throw new NotFoundException('reaction not found');
                ID = val._id
                if(val){
                    val = val.reactions.filter(res => res._id == comment_id)
                    return val[0]
                }
            })
        }

        if(!comment) throw new NotFoundException('comment / reaction not found');

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

        var comment = await this.commentModel.findById(comment_id)
        if(!comment) throw new NotFoundException('comment not found');

        var reactID = input.react_to.id
        if(reactID){
            const checkReact = comment.reactions.find(val => val._id == reactID)
            console.log('checkReact', checkReact)
            if(!checkReact){
                throw new BadRequestException('reaction id not found')
            }
        }
        
        input.react_to.id = comment.reactions.length == 0 ? comment_id : ( reactID ? reactID : comment_id )

        comment.reactions.unshift(input)
        await comment.save()

        return await this.commentModel.findById(comment_id)
    }

    // CRUD
    async commentList(product_id: string) {
        const query = await this.commentModel.find({product: product_id}).sort({ created_at: -1 })
        // .populate('product', ['name', 'type', 'slug', 'code', 'price', 'sale_price', 'visibility', 'tag'])
        return query
    }
}
