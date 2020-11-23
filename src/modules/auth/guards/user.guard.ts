import {
    Injectable,
    ExecutionContext
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { AuthGuard } from '@nestjs/passport';
  
  @Injectable()
  export class UserGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
      super();
    }
  
    handleRequest(err: any, user: any, info: Error, context: ExecutionContext) {
      if(!user) {
        return null;
      }
      return user
    }
  
   }
  