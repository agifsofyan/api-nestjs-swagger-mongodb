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
import { IProduct } from '../product/interfaces/product.interface';
import { IVideos } from '../videos/interfaces/videos.interface';
import { IBlog } from '../content/blog/interfaces/blog.interface';
import { IFulfillment } from '../content/fulfillment/interfaces/fulfillment.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CommentService {
    constructor(
		@InjectModel('Comment') private readonly commentModel: Model<IComment>,
		@InjectModel('Product') private readonly productModel: Model<IProduct>,
		@InjectModel('Video') private readonly videoModel: Model<IVideos>,
		@InjectModel('Blog') private readonly blogModel: Model<IBlog>,
		@InjectModel('Fulfillment') private readonly ffModel: Model<IFulfillment>
	) {}

    async newComment(userID: string, type: string, id: string, input: any) {
        input.user = userID
        
        const comment = new this.commentModel(input)

	if(type == 'product'){
	    comment.product = id
	    var product = await this.productModel.findById(id)
	    if(!product) throw new NotFoundException('product not found');
	}else if(type == 'video'){
            comment.video = id
            var video = await this.videoModel.findById(id)
            if(!video) throw new NotFoundException('video not found');

            video.comments.unshift(comment._id)
            await video.save()
        }else{
            comment.content = id
            var content:any = await this.blogModel.findById(id)
	    if(!content) content = await this.ffModel.findById(id);
            if(!content) throw new NotFoundException('content not found');
        }

        await comment.save()

        return comment
    }

    async likeComment(comment_id: string, user: any, isLike?: boolean) {
        var ID = comment_id
        const like:any = { liked_by: user._id }
        var react = false
        var comment:any = await this.commentModel.findById(comment_id)

        if(!comment){
            react = true
            comment = await this.commentModel.findOne({'reactions._id': comment_id})
            .then((val:any) => {
                if(!val) throw new NotFoundException('reaction not found');
                ID = val._id
                if(val){
                    val = val.reactions.filter(res => res._id == comment_id)
                    return val[0]
                }
            })
        }

        if(!comment) throw new NotFoundException('comment / reaction not found');

        var msg = 'already like this comment'

        const likeIt = (like:boolean) => {
            return comment.likes.filter((val) => {
                if(val){
                    if(like == true){
                        return val.liked_by.toString() == user._id.toString()
                    }else{
                        return val.liked_by.toString() != user._id.toString()
                    }
                }
            })
        }

        if(react){
            if(isLike == true && likeIt(true).length == 0 ) {
                await this.commentModel.findOneAndUpdate(
                    { 'reactions._id': comment_id },
                    { $push: {
                        'reactions.$.likes': {
                           $each: [ like ],
                           $position: 0
                        }
                    } },
                )
                
                msg = 'like this comment sucessfuly'
            }

            if(isLike == false){ 
                await this.commentModel.findOneAndUpdate(
                    { 'reactions._id': comment_id },
                    { $pull: {
                        'reactions.$.likes': like
                    } }
                )
                msg = 'like this comment sucessfuly'
            }
        }else{
            if(isLike == true && likeIt(true).length == 0) {
                comment.likes.unshift(like)
            }

            if(isLike == false){ 
                comment.likes = likeIt(false)
            }

            await comment.save()
            msg = 'like this comment sucessfuly'
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
            
            if(!checkReact){
                throw new BadRequestException('reaction id not found')
            }
        }
        
        input.react_to.id = comment.reactions.length == 0 ? comment_id : ( reactID ? reactID : comment_id )

        comment.reactions.unshift(input)
        await comment.save()

        return await this.commentModel.findById(comment_id)
    }

    async getComment(type: string, id: string) {
        var find:any = { video: id }
        if(type == 'content'){
            find = { content: id }
        }

        var comment = await this.commentModel.find(find)
        .populate('user', ['_id', 'name', 'avatar'])
        .populate('likes.liked_by', ['_id', 'name', 'avatar'])
        .populate('reactions.user', ['_id', 'name', 'avatar'])
        .populate('reactions.react_to.user', ['_id', 'name', 'avatar'])
        .populate('reactions.likes.liked_by', ['_id', 'name', 'avatar'])
        .select(['_id', 'user', 'comment', 'likes', 'reactions', 'created_at', 'updated_at'])

        return comment
    }
}
