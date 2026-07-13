import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRoleDto } from './dto/register-role.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../enums/user-role.enum';

@Controller('/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('auth/register/admin')
  registerAdmin(@Body() dto: RegisterRoleDto) {
    const adminDto = { ...dto, role: UserRole.ADMIN };
    return this.authService.registerWithRole(adminDto);
  }

  @Post('auth/register/investor')
  registerInvestor(@Body() dto: RegisterRoleDto) {
    const investorDto = { ...dto, role: UserRole.INVESTOR };
    return this.authService.registerWithRole(investorDto);
  }

  @Post('auth/register/employee')
  registerEmployee(@Body() dto: RegisterRoleDto) {
    const employeeDto = { ...dto, role: UserRole.STAFF };
    return this.authService.registerWithRole(employeeDto);
  }

  @Post('auth/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
