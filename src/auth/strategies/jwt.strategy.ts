import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../admin/interfaces/jwt-payload.interface';
import { AdminService } from '../../admin/admin.service';
import { jwtConstants } from '../../admin/constants/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private adminService: AdminService) {
    // ✅ typage correct, plus d'erreurs ESLint/TS
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    return await this.adminService.findOne(payload.sub);
  }
}
