import { 
	Injectable, 
	NotFoundException, 
	BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IVideos } from './interfaces/videos.interface';
import { IBlog } from '../content/blog/interfaces/blog.interface';
import { IFulfillment } from '../content/fulfillment/interfaces/fulfillment.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class VideosService {
    constructor(
		@InjectModel('Video') private readonly videoModel: Model<IVideos>,
		@InjectModel('Blog') private readonly blogModel: Model<IBlog>,
		@InjectModel('Fulfillment') private readonly ffModel: Model<IFulfillment>
	) {}

    async findVideo(video_id: any | []) {
        const query = await this.videoModel.find({ _id: { $in: video_id } })
        .populate({
            path: 'comments',
            select: ['_id', 'comment', 'created_at', 'reactions', 'likes'],
            populate: [
                { path: 'user', select: {_id:1, name:1, email:1, avatar:1} },
                { path: 'likes.liked_by', select: {_id:1, name:1, email:1, avatar:1} },
                { path: 'reactions.user', select: {_id:1, name:1, email:1, avatar:1} },
                { path: 'reactions.likes.liked_by', select: {_id:1, name:1, email:1, avatar:1} },
                { path: 'reactions.react_to.user', select: {_id:1, name:1, email:1, avatar:1} },
            ]
        })
        .populate({
            path: 'viewer',
            select: ['_id', 'on_datetime'],
            populate: [
                { path: 'user', select: {_id:1, name:1, email:1, avatar:1} },
            ]
        })
        .populate({
            path: 'likes',
            select: ['_id', 'on_datetime'],
            populate: [
                { path: 'user', select: {_id:1, name:1, email:1, avatar:1} },
            ]
        })
        .populate({
            path: 'shared',
            select: ['_id', 'on_datetime'],
            populate: [
                { path: 'user', select: {_id:1, name:1, email:1, avatar:1} },
            ]
        })

        return query
    }

    async add(video_id: string, user_id: string, ip: string, type: string, share_to?: string, isLike?: boolean): Promise<any> {
        var video = await this.videoModel.findById(video_id)

        if(!video){
            video = new this.videoModel({_id: ObjectId(video_id)})
        }

        const input:any = {
            user: user_id,
            ip: ip,
            on_datetime: new Date()
        }

        if(isLike == false){
            const liked = video[type].filter(val => {
                if(val){
                    return val.user.toString() != user_id.toString()
                }
            })  
            
            video[type] = liked
        }else{
            const liked = video[type].filter((val) => {
                if(val){
                    return val.user.toString() == user_id.toString()
                }
            })

            if(liked.length == 0) {   
                video[type].unshift(input)
            }
        }

        if(share_to && share_to != null) input.to = share_to;

        await video.save()

        return video[type]
    }

    async videoDetail(video_id: string): Promise<IVideos> {
        const video = await this.videoModel.findById(video_id)
        .populate('created_by', ['_id', 'name'])
        .populate('viewer.user', ['_id', 'name'])
        .populate('likes.user', ['_id', 'name'])
        .populate('shared.user', ['_id', 'name'])
        .select(['_id', 'url', 'likes', 'viewer', 'shared', 'created_at', 'created_by'])

        return video
    }
}
