import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

import { JwtStrategy } from './authentication/jwt.strategy';
import { JWT_SECRET } from './auth.constants';

import { RolesGuard } from './authorization/roles.guard';

@Module({
  imports: [
    UsersModule,

    JwtModule.register({
      secret: JWT_SECRET,

      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, RolesGuard],

  exports: [JwtModule, JwtStrategy],
})
export class AuthModule {}
