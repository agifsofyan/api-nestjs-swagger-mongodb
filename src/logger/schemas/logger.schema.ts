import * as mongoose from 'mongoose';

export const LoggerSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    hostName: String,
    endPoint: String, //baseUrl
    referer: String,
    method: String,
    platform: String,
    type: String,
    version: String,
    datetime: { type: Date, default: new Date() }
}, {
    collection: 'loggers',
    versionKey: false 
});
