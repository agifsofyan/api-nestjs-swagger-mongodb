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
    version: String
}, {
    collection: 'loggers',
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false } 
});