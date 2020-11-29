import { 
  Injectable, 
  ExecutionContext, 
  ForbiddenException, 
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err: any, user: any, info: Error, context: ExecutionContext) {
    //console.log('user role', user)
    const roles = this.reflector.get<string[]>('role', context.getHandler());
    if (!roles) {
      return true;
    }
    //console.log('roles role', roles)

    if(!user) {
      throw new UnauthorizedException();
    }

    const userRole = user.role.map(r => r.adminType)
    //console.log('userRole role', userRole)

    const hasRole = () => userRole.some((role: any) => roles.includes(role));
    // console.log('hasRole', hasRole)
    if (!hasRole) {
      throw new UnauthorizedException();
    }

    if (!(user.role && hasRole())) {
       throw new ForbiddenException('Forbidden');
    }

    return user && userRole && hasRole();
  }

 }
