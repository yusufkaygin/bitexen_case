import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountLoginDto {
  @ApiProperty({
    example: 'test@gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  // -------------------------------

  @ApiProperty({
    example: 'XXXXXXX',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

// TODO telefon ve mail icin ozel func yaz
