import { Module } from '@nestjs/common';
import { 
    APP_FILTER, 
    APP_INTERCEPTOR, 
    APP_PIPE 
} from '@nestjs/core';

import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
// import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { ValidationPipe } from './pipes/validation.pipe';

@Module({
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor
        },
        // {
        //     provide: APP_PIPE,
        //     useClass: ParseIntPipe
        // },
        {
            provide: APP_PIPE,
            useClass: ValidationPipe
        }
    ]
})
export class SharedModule {}
