import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterRoleDto } from './dto/register-role.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async registerWithRole(dto: RegisterRoleDto) {
    const regDto = { ...dto, isActive: true };
    const user = await this.usersService.create(regDto);

    return {
      message: 'User registered successfully',
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [userWithPassword] = await this.usersService['userModel']
      .find({ _id: user._id })
      .select('+passwordHash')
      .exec();

    if (!userWithPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(
      dto.password,
      (userWithPassword as any).passwordHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: userWithPassword.id,
      email: userWithPassword.email,
      full_name: (userWithPassword as any).name,
      role: userWithPassword.role,
    };
    return {
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    };
  }
}
