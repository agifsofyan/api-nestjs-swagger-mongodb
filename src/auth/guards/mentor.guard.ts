import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { Observable } from 'rxjs';

Injectable()
export class MentorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const { user } = request;
    if (user && user.type === 'mentor') {
      return true;
    } 
    throw new HttpException('Unauthorized access.', HttpStatus.UNAUTHORIZED);
  }
}
