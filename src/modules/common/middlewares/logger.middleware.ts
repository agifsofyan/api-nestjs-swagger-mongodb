import { Injectable, NestMiddleware, MiddlewareConsumer } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    throw new Error("Method not implemented.");
  }
  resolve(context: string): MiddlewareConsumer {
    return (req: any, res: any, next: () => void) => {
      next();
    };
  }
}