import { Document } from 'mongoose';

export interface ILogger extends Document {
    ip: any;
    userAgent: any;
    hostName: any;
    endPoint: any; //baseUrl
    referer: any;
    method: any;
    platform: any;
    type: any;
    version: any;
    datetime: Date;
}
