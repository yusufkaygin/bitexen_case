import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import { AccountService } from './account.service';

import * as bcrypt from 'bcrypt';
import { AccountCreateDto } from './dto/create-account.dto';
import { AccountLoginDto } from './dto/login-account.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { createResponse } from 'src/utils/createResponse.utils';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private jwtService: JwtService,
  ) {}

  // ------------------------------------ Register  ------------------------------------

  @Post('create')
  @ApiOperation({
    summary: 'Yeni bir kullanıcı hesabı oluşturur.',
  })
  async register(@Body() accountCreateDto: AccountCreateDto) {
    try {
      const hashedPassword = await bcrypt.hash(accountCreateDto.password, 12);
      accountCreateDto.password = hashedPassword;

      const user = await this.accountService.create(accountCreateDto);

      return createResponse({
        message: {
          message: 'Hesap başarıyla oluşturuldu.',
          userId: user.id,
        },
      });
    } catch ({ message }) {
      return createResponse({ isError: true, message: { message } });
    }
  }

  // ------------------------------------ Login ----------------------------------------

  @Post('login')
  @ApiOperation({
    summary: 'Kullanıcı hesabı ile giriş yapar ve JWT token döndürür.',
  })
  async login(
    @Body() accountLoginDto: AccountLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const query = { email: accountLoginDto.email };
      const account = await this.accountService.findOne(query);

      if (!account) throw new BadRequestException('invalid credentials');

      const isPasswordMatch = await bcrypt.compare(
        accountLoginDto.password,
        account.password,
      );
      if (!isPasswordMatch)
        throw new BadRequestException('invalid credentials');

      const jwt = await this.jwtService.signAsync({ id: account.id });
      response.cookie('jwt', jwt, { httpOnly: true });
      delete account.password;

      return createResponse({
        message: {
          message: 'Hesap başarıyla getirildi.',
          data: account,
          token: jwt,
        },
      });
    } catch ({ message }) {
      return createResponse({ isError: true, message: { message } });
    }
  }

  // ------------------------------------ Logout ----------------------------------------

  @Post('logout')
  @ApiOperation({
    summary: 'Kullanıcının mevcut oturumunu sonlandırır ve çerezleri temizler.',
  })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return createResponse({
      message: { message: 'Çıkış yapıldı.' },
    });
  }
}
