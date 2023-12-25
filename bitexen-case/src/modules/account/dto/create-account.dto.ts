import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AccountCreateDto {
  @ApiProperty({
    example: 'yusuf test',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // -------------------------------

  @ApiProperty({
    example: '+90 5555555555',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  // -------------------------------

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
