import { Body, Controller, Get, Headers, Patch, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletCreateDto } from './dto/create-wallet.dto';
import { JwtService } from '@nestjs/jwt';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createResponse } from 'src/utils/createResponse.utils';
import { WalletDepositDto } from './dto/deposit-wallet.dto';
import { WalletTransferDto } from './dto/transfer.wallet.dto';
import { EventPattern } from '@nestjs/microservices';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private jwtService: JwtService,
  ) {}

  // ------------------------------------ Create ----------------------------------------

  @Post('create')
  @ApiOperation({
    summary: 'Kullanıcı için yeni bir cüzdan oluşturur.',
  })
  async create(
    @Body() walletCreateDto: WalletCreateDto,
    @Headers('token') token: string,
  ) {
    try {
      const { id } = await this.jwtService.verifyAsync(token);
      walletCreateDto.accountId = id;

      const wallet = await this.walletService.create(walletCreateDto);

      return createResponse({
        message: {
          walletId: wallet.id,
          message: 'Cüzdan başarıyla oluşturuldu.',
        },
      });
    } catch ({ message }) {
      return createResponse({ isError: true, message: { message } });
    }
  }

  // ------------------------------------ Deposit ----------------------------------------

  @Patch('deposit')
  @ApiOperation({
    summary: 'Kullanicinin cüzdanina para yatirma.',
  })
  async deposit(
    @Body() walletDepositDto: WalletDepositDto,
    @Headers('token') token: string,
  ) {
    try {
      const { id } = await this.jwtService.verifyAsync(token);
      walletDepositDto.accountId = id.toString();

      // NOTE cuzdana erisim izni olup olmadigi kontrol edilir
      const currentWallet = await this.walletService.findOne({
        where: {
          id: walletDepositDto.walletId,
          accountId: walletDepositDto.accountId,
        },
        relations: ['currency', 'account'],
      });

      if (!currentWallet)
        return createResponse({
          isError: true,
          message: { message: 'Cuzdan bulunamadi.' },
        });

      await this.walletService.deposit(walletDepositDto);
      const { currency, balance } = currentWallet;

      return createResponse({
        message: {
          walletId: walletDepositDto.walletId,
          message: 'Para yatırma işlemi başarılı.',
          clientMessage: `${currency.name} hesabınıza ${
            walletDepositDto.amount
          }${currency.code} girdi. Güncel bakiyeniz: ${
            balance + walletDepositDto.amount
          }${currency.code}`,
        },
      });
    } catch ({ message }) {
      return createResponse({ isError: true, message: { message } });
    }
  }

  // ------------------------------------ Deposit RabbitMQ ----------------------------------------

  @EventPattern('wallet_deposit') // RABBITMQ consumer
  async depositRabbitMQ(data: any) {
    const {
      token,
      walletDepositDto,
    }: { token: string; walletDepositDto: WalletDepositDto } = data;

    console.log("RabbitMQ consumer'i calisiyor...");

    try {
      const { id } = await this.jwtService.verifyAsync(token);
      walletDepositDto.accountId = id.toString();
      // NOTE cuzdana erisim izni olup olmadigi kontrol edilir
      const currentWallet = await this.walletService.findOne({
        where: {
          id: walletDepositDto.walletId,
          accountId: walletDepositDto.accountId,
        },
        relations: ['currency', 'account'],
      });
      if (!currentWallet)
        return createResponse({
          isError: true,
          message: { message: 'Cuzdan bulunamadi.' },
        });
      await this.walletService.deposit(walletDepositDto);
      const { currency, balance } = currentWallet;
      return createResponse({
        message: {
          walletId: walletDepositDto.walletId,
          message: 'Para yatırma işlemi başarılı.',
          clientMessage: `${currency.name} hesabınıza ${
            walletDepositDto.amount
          }${currency.code} girdi. Güncel bakiyeniz: ${
            balance + walletDepositDto.amount
          }${currency.code}`,
        },
      });
    } catch ({ message }) {
      return createResponse({ isError: true, message: { message } });
    }
  }

  // ----------------------------- Get User Wallets by ID ----------------------------------

  @Get('me')
  @ApiOperation({
    summary: 'Kullanıcının tüm cüzdanlarını görüntüler.',
  })
  async balance(@Headers('token') token: string) {
    const { id } = await this.jwtService.verifyAsync(token);

    const userWallets = await this.walletService.getUserWalletsById(id);

    // duzenli gozukmesi icin
    const formattedData = userWallets.map((wallet) => ({
      walletId: wallet.id,
      balance: wallet.balance,
      currency: wallet.currency.code,
    }));

    return createResponse({ message: formattedData });
  }

  // ------------------------------------ Transfer ----------------------------------------

  @Post('transfer')
  @ApiOperation({
    summary:
      'Belirli bir kullanıcıdan başka bir kullanıcıya para transferi yapar.',
  })
  async transfer(
    @Body() walletTransferDto: WalletTransferDto,
    @Headers('token') token: string,
  ) {
    try {
      const { id } = await this.jwtService.verifyAsync(token);
      walletTransferDto.fromAccountId = id.toString();

      const { fromAccountId, toAccountId, amount, currencyId } =
        walletTransferDto;

      // paranin cikacagi cuzdan
      const senderWallet = await this.walletService.findOne({
        where: { accountId: fromAccountId, currencyId },
        relations: ['currency'],
      });

      // paranin girecegi cuzdan
      const receiverWallet = await this.walletService.findOne({
        where: { accountId: toAccountId, currencyId },
        relations: ['currency'],
      });

      // cuzdanlar eslesti mi
      if (!senderWallet || !receiverWallet)
        return createResponse({
          isError: true,
          message: { message: 'Hata! Cüzdanlar eşleşmedi.' },
        });

      // ------------------- critical works ----------------------

      // islemler bittikten sonra bu degerlerle uyusmaz ise balance islem iptal edilir
      const requiredSenderBalance = senderWallet.balance - amount;
      const requiredReceiverBalance = receiverWallet.balance + amount;

      // ----------------------- 0 -------------------------------

      // hesap bakiye kontrolu
      if (senderWallet.balance < amount)
        return createResponse({
          isError: true,
          message: { message: 'Bakiye yetersiz.' },
        });

      // ----------------------- 1 -------------------------------

      // ilk para gondericiden cikarilir
      await this.walletService.deposit({
        walletId: senderWallet.id,
        amount: -amount,
        accountId: fromAccountId,
      });

      // ----------------------- 2 --------------------------------

      // para aliciya eklenir
      await this.walletService.deposit({
        walletId: receiverWallet.id,
        amount: amount,
        accountId: toAccountId,
      });

      // ----------------------- 3 --------------------------------

      // gondericiden dogru sekilde eksilmis mi?
      const senderWalletCheck = await this.walletService.findOne({
        where: {
          id: senderWallet.id, // walletId
          balance: requiredSenderBalance,
        },
      });

      // gondericiden dogru sekilde eksilmis mi?
      const receiverWalletCheck = await this.walletService.findOne({
        where: {
          id: receiverWallet.id, // walletId
          balance: requiredReceiverBalance,
        },
      });

      // ----------------------- 4 --------------------------------

      // 2 hesaptan birinde veya ikisinde anormallik varsa islemi geri al
      if (!senderWalletCheck || !receiverWalletCheck) {
        // islemler geri alinir
        // hesaplardaki para ilk haline gelir

        await this.walletService.deposit({
          walletId: senderWallet.id,
          amount: requiredSenderBalance,
          accountId: fromAccountId,
        });

        await this.walletService.deposit({
          walletId: receiverWallet.id,
          amount: requiredReceiverBalance,
          accountId: toAccountId,
        });

        return createResponse({
          isError: true,
          message: {
            message:
              'İşleminiz gerçekleştirilirken beklenmedik bir hata oluştu. Lütfen bizimle iletişime geçin.',
          },
        });
      }

      // ----------------------- 5 --------------------------------
      // buraya geldigi zaman hersey yolundadir loglama ve islemi kapatma zamani

      await this.walletService.transferLogger({
        amount,
        currencyId,
        fromAccountId,
        toAccountId,
      });

      return createResponse({
        isError: false,
        message: { message: 'Transfer işlemi başarıyla tamamlandı.' },
      });
    } catch ({ message }) {
      return createResponse({ isError: true, message: { message } });
    }
  }
}

/*

  PARA TRANSFERI -q
  1 - hata olmamasi icin son durumda hesaplarda olmasi gereken para tutulur ve en son islemde kontrol edilecektir. Sayilar birbirine uymazsa islem iptal edilir
  2 - paranin cikacagi ve paranin girecegi cuzdanlara ulasilir
  3 - paranin cikacagi cuzdanki bakiye ile gonderilmek istenen bakiye kontrol edilir
  4 - tum sartlar uygunsa 
        * ilk olarak para cekilir, para cekildiginden emin olduktan sonra para transfer edilir
        * para transferi kontrol edilir ve son kez giren cikan paralar gozden gecirilir ve islem sonlanir
  5 - son olarak bu yapilan islem `transactions` tablosuna loglanir

*/
