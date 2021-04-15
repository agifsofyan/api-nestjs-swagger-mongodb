import { Injectable, NestMiddleware, Logger, Req } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILogger } from '../../logger/interfaces/logger.interface';

@Injectable()
export class LogsMiddleware implements NestMiddleware {
    req: typeof Req;
  constructor(
		  @InjectModel('Logger') private readonly loggerModel: Model<ILogger>
    ) {
      this.req = Req
  }

  private logger = new Logger('HTTP');

  private async matchDate(userAgent) {
    const now = new Date()
    const day = now.getDate() //- 1
    const month = now.getMonth() //+ 1
    const year = now.getFullYear()

    const query = await this.loggerModel.aggregate([
      { $match: { userAgent: userAgent } },
      { $project: {
        y: { $year: "$datetime" },
        m: { $month: "$datetime" },
        d: { $dayOfMonth: "$datetime" }
      }},
      { $match: { y: year, m: month, d: day } }
    ]);

    return query.length > 0 ? false : true
  }

  async use(request: Request, response: Response, next: NextFunction) {
    const { ip, method, baseUrl } = request
    const userAgent = request.get('user-agent') || ''
    const hostName = require('os').hostname()
    const referer = request.get('referer') || ''
    const platform = require('os').platform()
    const type = require('os').type()
    const version = require('os').version()

    const checkLog = await this.matchDate(userAgent)
    //console.log('checkLog', checkLog)

    const logger = {
      ip, userAgent, hostName, endPoint: baseUrl, referer, method, platform, type, version
    }

    response.on('close', async () => {
      if(checkLog){
      	const logs = new this.loggerModel(logger)
      	await logs.save()
          // this.logger.log(logs);
      }
      // this.logger.log("logs empty");
    });

    next();
  }
}
