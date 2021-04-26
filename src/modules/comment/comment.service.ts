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
import { IContent } from '../content/interfaces/content.interface';
import { IVideos } from '../videos/interfaces/videos.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class CommentService {
    constructor(
		@InjectModel('Comment') private readonly commentModel: Model<IComment>,
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
		@InjectModel('Video') private readonly videoModel: Model<IVideos>,
	) {}

    async newComment(userID: string, type: string, id: string, input: any) {
        input.user = userID
        
        const comment = new this.commentModel(input)

        if(type == 'video'){
            comment.video = id
            var video = await this.videoModel.findById(id)
            if(!video) throw new NotFoundException('video not found');

            video.comments.unshift(comment._id)
            await video.save()
        }else{
            comment.content = id
            const content = await this.contentModel.findById(id)
            if(!content) throw new NotFoundException('content not found');
        }

        delete comment.id

        await comment.save()

        return comment
    }

    async likeComment(comment_id: string, user: any) {
        var ID = comment_id
        const like:any = { liked_by: user._id }
        var react = false
        var comment:any = await this.commentModel.findById(comment_id)

        if(!comment){
            react = true
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
                return val.liked_by.toString() == user._id.toString()
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

        var comment = await this.commentModel.findOne(find)
        .populate('user', ['_id', 'name'])
        .populate('likes.liked_by', ['_id', 'name'])
        .populate('reactions.user', ['_id', 'name'])
        .populate('reactions.react_to.user', ['_id', 'name'])
        .populate('reactions.likes.liked_by', ['_id', 'name'])
        .select(['_id', 'user', 'comment', 'likes', 'reactions', 'created_at', 'updated_at'])

        return comment
    }

    // CRUD
    async commentList(product_id: string) {
        const query = await this.commentModel.find({product: product_id}).sort({ created_at: -1 })
        return query
    }

    async commentPreview(product_id:string, video_id?:string) {
        var match:any = { product: product_id }

        if(video_id) match.video = video_id

        return await this.commentModel.find(match)
        .populate('user', ['_id', 'name', 'email', 'avatar'])
        .populate('likes.liked_by', ['_id', 'name', 'email', 'avatar'])
        .populate('reactions.user', ['_id', 'name', 'email', 'avatar'])
        .populate('reactions.react_to.user', ['_id', 'name', 'email', 'avatar'])
        .populate('reactions.likes.liked_by', ['_id', 'name', 'email', 'avatar'])
        .select([
            '_id', 
            'comment',
            'user',
            'likes',
            'reactions.comment',
            'reactions.likes',
            'reactions.user',
            'reactions.react_to',
            'reactions.created_at',
            'created_at'
        ])
        .sort({created_at: -1})
    }
}
