import { Controller, Get, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
  private logger: Logger = new Logger('Login');

  constructor(private loginService: LoginService) {}

  @Get()
  login(@Res() response: Response): void {
    this.logger.log('User just logged in!');
    response.redirect(this.loginService.authUrl);
  }
}
