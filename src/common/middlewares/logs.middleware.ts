import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILogger } from 'src/logger/interfaces/logger.interface';
import * as moment from 'moment';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
  constructor(
		  @InjectModel('Logger') private readonly loggerModel: Model<ILogger>
    ) {}

  // private logger = new Logger('HTTP');

  async use(request: Request, response: Response, next: NextFunction) {
    const { ip, method, baseUrl } = request
    const userAgent = request.get('user-agent') || ''
    const hostName = require('os').hostname()
    const referer = request.get('referer') || ''
    const platform = require('os').platform()
    const type = require('os').type()
    const version = require('os').version()

    const now = new Date()
    // const toDate = moment(now).format('YY/MM/DD')
    const getDate = now.getDate()
    const getMonth = now.getMonth()
    const getYear = now.getFullYear()
    console.log('getYear', getYear)

    const logger = {
      ip, userAgent, hostName, endPoint: baseUrl, referer, method, platform, type, version
    }

    response.on('close', async () => {
      const logs = new this.loggerModel(logger)
      // await logs.save()
      // this.logger.log(logs);
    });

    next();
  }
}
