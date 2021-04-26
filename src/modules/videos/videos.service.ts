import { 
	Injectable, 
	NotFoundException, 
	BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { IVideos } from './interfaces/videos.interface';
import { IContent } from '../content/interfaces/content.interface';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class VideosService {
    constructor(
		@InjectModel('Video') private readonly videoModel: Model<IVideos>,
		@InjectModel('Content') private readonly contentModel: Model<IContent>,
	) {}

    async findVideo(video_id: any | []) {
        // const query = await this.videoModel.find({ _id: { $in: video_id }, 'removed.deleted_at': { $nin: [null] } })
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

    async checkVideo(video_id: string): Promise<any> {
        var content
        console.log('video_id', video_id)
        try {
            content = await this.contentModel.findOne({video: video_id})
        } catch (error) {
            throw new BadRequestException('video_id not valid format')
        }

        if(!content) throw new NotFoundException('content not found')
        if(content.video.length <= 0) throw new NotFoundException('video not found')

        const videos = content.video.filter((v:any)=>v._id.toString()==video_id.toString())
        const video = videos.length == 0 ? {} : videos[0]
        return video
    }

    async add(video_id: string, user_id: string, ip: string, type: string, share_to?: string): Promise<any> {
        await this.checkVideo(video_id)

        var video = await this.videoModel.findById(video_id)

        if(!video){
            video = new this.videoModel({_id: ObjectId(video_id)})
        }

        const input:any = {
            user: user_id,
            ip: ip,
            on_datetime: new Date()
        }

        if(share_to) input.to = share_to;

        const liked = video[type].filter((val) => {
            if(val){
                return val.user.toString() == user_id.toString()
            }
        })

        if(liked.length == 0) {   
            video[type].unshift(input)
        }

        await video.save()

        return video[type]
    }

    async videoDetail(video_id: string): Promise<IVideos> {
        const video = await this.videoModel.findById(video_id)
        .populate('created_by', ['_id', 'name'])
        .populate('viewer.user', ['_id', 'name'])
        .populate('likes.user', ['_id', 'name'])
        .populate('shared.user', ['_id', 'name'])
        // .populate({
        //     path: 'comments',
        //     select: ['_id', 'comment', 'user', 'likes', 'reactions'],
        //     populate: [{
        //         path: 'user',
        //         select: ['_id', 'name']
        //     },{
        //         path: 'likes.liked_by',
        //         select: ['_id', 'name']
        //     },{
        //         path: 'reactions.user',
        //         select: ['_id', 'name']
        //     },{
        //         path: 'reactions.react_to.user',
        //         select: ['_id', 'name']
        //     },{
        //         path: 'reactions.likes.liked_by',
        //         select: ['_id', 'name']
        //     }]
        // })
        .select(['_id', 'url', 'likes', 'viewer', 'shared', 'created_at'])

        return video
    }
}
