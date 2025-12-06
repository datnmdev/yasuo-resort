import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { DataSource, Not, Repository } from 'typeorm';
import { PayDepositReqDto } from './dtos/pay.dto';
import * as moment from 'moment';
import { ConfigService } from 'common/config/config.service';
import { Booking } from 'modules/booking/entities/booking.entity';
import { Request } from 'express';
import VnpayUtils from 'common/utils/vnpay.util';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { HandleVnpayIpnDto } from './dtos/handle-vnpay-ipn.dto';
import * as _ from 'lodash';
import * as path from 'path';
import { htmlToPdf } from 'utils/puppeteer.util';
import * as fs from 'fs';
import * as ejs from 'ejs';
import { Invoice } from 'modules/invoice/entities/invoice.entity';
import { BookingService } from 'modules/booking/entities/booking-service.entity';
import { BookingService as BookingServiceEntity } from 'modules/booking/entities/booking-service.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) { }

  async getReceipts(userId: number, bookingId: number) {
    const booking = await this.dataSource.manager.findOne(Booking, {
      where: {
        id: bookingId,
        userId,
      },
      relations: ['payments'],
    });
    if (!booking) {
      throw new NotFoundException({
        message: 'Booking ID not found',
        error: 'BadRequest',
      });
    }
    return booking.payments
      .filter((p) => p.status === 'success' || p.status === 'refunded')
      .map((p) =>
        path.join(
          this.configService.getServerConfig().baseUrl,
          'uploads',
          `${JSON.parse(p.gatewayResponse).vnp_OrderInfo}_Receipt.pdf`,
        ),
      );
  }

  async pay(req: Request, body: PayDepositReqDto) {
    const booking = await this.dataSource.manager.findOne(Booking, {
      where: {
        id: body.bookingId,
        userId: req.user.id,
      },
      relations: ['contract', 'bookingServices'],
    });
    if (!booking) {
      throw new BadRequestException({
        message: 'Booking not found',
        error: 'BadRequest',
      });
    }
    if (
      body.paymentStage === 'deposit_payment' &&
      booking.status !== 'pending'
    ) {
      throw new BadRequestException({
        message: 'Booking status is not valid for deposit payment',
        error: 'BadRequest',
      });
    }
    if (
      body.paymentStage === 'final_payment' &&
      booking.status !== 'confirmed'
    ) {
      throw new BadRequestException({
        message: 'Booking status is not valid for final payment',
        error: 'BadRequest',
      });
    }
    if (!booking.contract) {
      throw new ConflictException('Booking does not have a contract');
    }
    if (!booking.contract.signedByUser) {
      throw new ConflictException("Your contract haven't signed yet");
    }
    const paymentExistings = await this.paymentRepository.find({
      where: {
        bookingId: body.bookingId,
        status: 'success',
      },
    });
    if (
      body.paymentStage === 'deposit_payment' &&
      paymentExistings.some((e) =>
        JSON.parse(e.gatewayResponse).vnp_TxnRef.startsWith('DP'),
      )
    ) {
      throw new BadRequestException({
        message: 'Deposit payment already exists for this booking',
        error: 'BadRequest',
      });
    }
    if (body.paymentStage === 'final_payment' && moment().isBefore(moment(booking.endDate))) {
      throw new ConflictException("The contract payment is not yet due. Please come back later!")
    }
    if (
      body.paymentStage === 'final_payment' &&
      paymentExistings.some((e) =>
        JSON.parse(e.gatewayResponse)?.vnp_TxnRef?.startsWith('FP'),
      )
    ) {
      throw new BadRequestException({
        message: 'Final payment already exists for this booking',
        error: 'BadRequest',
      });
    }
    const date = moment();
    const orderId = `${body.bookingId}${date.format('YYYYMMDDHHmmss')}`;
    const orderInfo = `${body.paymentStage === 'deposit_payment' ? 'DP' : 'FP'}-${orderId}`;
    const hmac = crypto.createHmac(
      'sha512',
      this.configService.getVnpConfig().vnpHashSecret,
    );

    // Quy đổi USD sang VND
    let amount = Number(booking.totalPrice) * 0.2;
    if (body.paymentStage === 'final_payment') {
      // Tổng tiền dịch vụ được đặt sau khi đặt phòng
      let totalNewServicesAfterBookingRoom = 0;
      const newServicesAfterBookingRoom = await this.dataSource.manager.find(
        BookingService,
        {
          where: {
            bookingId: booking.id,
            isBookedViaCombo: 0,
            createdAt: Not(booking.createdAt),
            status: 'confirmed',
          },
        },
      );
      for (const sv of newServicesAfterBookingRoom) {
        totalNewServicesAfterBookingRoom +=
          sv.quantity *
          (moment(sv.endDate).diff(moment(sv.startDate), "days") + 1) *
          Number(sv.price);
      }
      amount = Number(booking.totalPrice) + totalNewServicesAfterBookingRoom;
    }

    const getConvertedAmountRes = await fetch(
      `https://v6.exchangerate-api.com/v6/f4d3e9752dc7d1cd41b4563f/pair/USD/VND/${amount}`,
      {
        method: 'GET',
      },
    ).then((res) => res.json());
    if (getConvertedAmountRes.result !== 'success') {
      throw new InternalServerErrorException({
        message: 'Failed to convert currency',
        error: 'BadRequest',
      });
    }

    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.configService.getVnpConfig().vnpTmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: Math.ceil(getConvertedAmountRes.conversion_result) * 100,
      vnp_ReturnUrl: this.configService.getVnpConfig().vnpReturnUrl,
      vnp_IpAddr: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      vnp_CreateDate: date.format('YYYYMMDDHHmmss'),
      vnp_BankCode: body.bankCode,
    };
    const vnpParams = {
      ...params,
      vnp_SecureHash: hmac
        .update(qs.stringify(VnpayUtils.sortObject(params), { encode: false }))
        .digest('hex'),
    };
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Lưu thông tin payment
      const paymentEntity = queryRunner.manager.create(Payment, {
        id: orderId,
        bookingId: body.bookingId,
        paymentDate: date.toDate(),
        amount: amount.toFixed(2),
        status: 'pending',
      });
      await queryRunner.manager.save(paymentEntity);
      await queryRunner.commitTransaction();
      return `${this.configService.getVnpConfig().vnpUrl}?${qs.stringify(vnpParams, { encode: false })}`;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async handleVnpIpn(handleVnpayIpnDto: HandleVnpayIpnDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const vnpParams = handleVnpayIpnDto;
      const vnpSecureHash = vnpParams.vnp_SecureHash;
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];
      const hmac = crypto.createHmac(
        'sha512',
        this.configService.getVnpConfig().vnpHashSecret,
      );
      const signed = hmac
        .update(
          qs.stringify(VnpayUtils.sortObject(vnpParams), { encode: false }),
        )
        .digest('hex');
      const payment = await this.paymentRepository.findOne({
        where: {
          id: vnpParams.vnp_TxnRef,
        },
        relations: [
          'booking',
          'booking.bookingServices',
          'booking.bookingServices.service',
          'booking.user',
          'booking.room',
          'booking.payments',
        ],
      });

      if (vnpSecureHash === signed) {
        if (payment) {
          const getConvertedAmountRes = await fetch(
            `https://v6.exchangerate-api.com/v6/f4d3e9752dc7d1cd41b4563f/pair/USD/VND/${payment.amount}`,
            {
              method: 'GET',
            },
          ).then((res) => res.json());
          if (getConvertedAmountRes.result !== 'success') {
            throw new InternalServerErrorException({
              message: 'Failed to convert currency',
              error: 'BadRequest',
            });
          }
          if (
            Math.ceil(getConvertedAmountRes.conversion_result) * 100 ==
            Number(vnpParams.vnp_Amount)
          ) {
            if (payment.status === 'pending') {
              try {
                if (vnpParams.vnp_ResponseCode == '00') {
                  await queryRunner.manager.update(
                    Payment,
                    vnpParams.vnp_TxnRef,
                    {
                      status: 'success',
                      transactionCode: vnpParams.vnp_TransactionNo,
                      gatewayResponse: JSON.stringify(
                        _.omit(vnpParams, [
                          'vnp_SecureHash',
                          'vnp_SecureHashType',
                        ]),
                      ),
                    },
                  );

                  // Xuất biên lai
                  const contractHTML = await ejs.renderFile(
                    path.join(
                      process.cwd(),
                      'src/assets/templates/receipt.ejs',
                    ),
                    {
                      payment: {
                        ...payment,
                        paymentDate: {
                          day: moment(payment.paymentDate).daysInMonth(),
                          month: moment(payment.paymentDate).format('MMMM'),
                          year: moment(payment.paymentDate).year(),
                        },
                        booking: {
                          ...payment.booking,
                          startDate: moment(payment.booking.startDate).format(
                            'DD/MM/YYYY',
                          ),
                          endDate: moment(payment.booking.endDate).format(
                            'DD/MM/YYYY',
                          ),
                          bookingServices: payment.booking.bookingServices.map(
                            (e) => ({
                              ...e,
                              totalPrice: (
                                e.quantity *
                                (moment(e.endDate).diff(
                                  moment(e.startDate),
                                  'days',
                                ) +
                                  1) *
                                Number(e.price)
                              ).toFixed(2),
                            }),
                          ),
                          subTotalPrice: (
                            payment.booking.capacity *
                            (moment(payment.booking.endDate).diff(
                              moment(payment.booking.startDate),
                              'days',
                            ) +
                              1) *
                            Number(payment.booking.roomPrice)
                          ).toFixed(2),
                        },
                        nights:
                          moment(payment.booking.endDate).diff(
                            moment(payment.booking.startDate),
                            'days',
                          ) + 1,
                      },
                    },
                    {
                      async: true,
                    },
                  );
                  const fileName = `${vnpParams.vnp_OrderInfo}_Receipt`;
                  const fileRelativePath = path.join(
                    'uploads',
                    `${fileName}.html`,
                  );
                  await fs.promises.writeFile(
                    path.join(process.cwd(), fileRelativePath),
                    contractHTML,
                  );
                  await htmlToPdf(
                    path.join(process.cwd(), fileRelativePath),
                    path.join(
                      process.cwd(),
                      path.join('uploads', `${fileName}.pdf`),
                    ),
                  );
                  await fs.promises.unlink(
                    path.join(process.cwd(), fileRelativePath),
                  );

                  if (vnpParams.vnp_OrderInfo.substring(0, 2) == 'FP') {
                    const invoices = await queryRunner.manager.findAndCount(
                      Invoice,
                      {
                        order: {
                          id: 'DESC',
                        },
                        take: 1,
                      },
                    );

                    // Tổng tiền ban đầu (không bao gồm voucher và ưu đãi từ combo)
                    let subTotalAmount = 0;
                    // Tiền phòng gốc
                    subTotalAmount +=
                      Number(payment.booking.roomPrice) *
                      (moment(payment.booking.endDate).diff(
                        moment(payment.booking.startDate), "days"
                      ) +
                        1);
                    // Tiền dịch vụ gốc
                    const services = await queryRunner.manager.find(
                      BookingService,
                      {
                        where: {
                          status: 'confirmed',
                        },
                      },
                    );
                    for (const sv of services) {
                      subTotalAmount +=
                        sv.quantity *
                        (moment(sv.endDate).diff(moment(sv.startDate), "days") + 1) *
                        Number(sv.price);
                    }

                    // Tổng tiền dịch vụ được đặt sau khi đặt phòng
                    let totalNewServicesAfterBookingRoom = 0;
                    const newServicesAfterBookingRoom =
                      await queryRunner.manager.find(BookingService, {
                        where: {
                          bookingId: payment.bookingId,
                          isBookedViaCombo: 0,
                          createdAt: Not(payment.booking.createdAt),
                          status: 'confirmed',
                        },
                      });
                    for (const sv of newServicesAfterBookingRoom) {
                      totalNewServicesAfterBookingRoom +=
                        sv.quantity *
                        (moment(sv.endDate).diff(moment(sv.startDate), "days") + 1) *
                        Number(sv.price);
                    }

                    // Lưu hoá đơn
                    const invoiceEntity = queryRunner.manager.create(Invoice, {
                      bookingId: payment.bookingId,
                      invoiceNumber:
                        invoices[1] <= 0
                          ? String(1).padStart(8, '0')
                          : String(
                            Number(invoices[0][0].invoiceNumber) + 1,
                          ).padStart(8, '0'),
                      invoiceDate: new Date(),
                      subTotalAmount: subTotalAmount.toFixed(2),
                      discountAmount: (
                        subTotalAmount -
                        (Number(payment.booking.totalPrice) +
                          totalNewServicesAfterBookingRoom)
                      ).toFixed(2),
                      totalAmount: (
                        Number(payment.booking.totalPrice) +
                        totalNewServicesAfterBookingRoom
                      ).toFixed(2),
                    });
                    const newInvoice =
                      await queryRunner.manager.save(invoiceEntity);

                    // Xuất hoá đơn
                    const contractHTML = await ejs.renderFile(
                      path.join(
                        process.cwd(),
                        'src/assets/templates/invoice.ejs',
                      ),
                      {
                        payment: {
                          ...payment,
                          paymentDate: {
                            day: moment(payment.paymentDate).daysInMonth(),
                            month: moment(payment.paymentDate).format('MMMM'),
                            year: moment(payment.paymentDate).year(),
                          },
                          booking: {
                            ...payment.booking,
                            startDate: moment(payment.booking.startDate).format(
                              'DD/MM/YYYY',
                            ),
                            endDate: moment(payment.booking.endDate).format(
                              'DD/MM/YYYY',
                            ),
                            bookingServices:
                              payment.booking.bookingServices.map((e) => ({
                                ...e,
                                totalPrice: (
                                  e.quantity *
                                  (moment(e.endDate).diff(
                                    moment(e.startDate),
                                    'days',
                                  ) +
                                    1) *
                                  Number(e.price)
                                ).toFixed(2),
                              })),
                            invoice: newInvoice,
                            subTotalPrice: (
                              payment.booking.capacity *
                              (moment(payment.booking.endDate).diff(
                                moment(payment.booking.startDate),
                                'days',
                              ) +
                                1) *
                              Number(payment.booking.roomPrice)
                            ).toFixed(2),
                          },
                          nights:
                            moment(payment.booking.endDate).diff(
                              moment(payment.booking.startDate),
                              'days',
                            ) + 1,
                        },
                        receipt: payment.booking.payments.filter(
                          (e) => e.status === 'success',
                        )[0],
                      },
                      {
                        async: true,
                      },
                    );
                    const fileName = `${newInvoice.invoiceNumber}_Invoice`;
                    const fileRelativePath = path.join(
                      'uploads',
                      `${fileName}.html`,
                    );
                    await fs.promises.writeFile(
                      path.join(process.cwd(), fileRelativePath),
                      contractHTML,
                    );
                    await htmlToPdf(
                      path.join(process.cwd(), fileRelativePath),
                      path.join(
                        process.cwd(),
                        path.join('uploads', `${fileName}.pdf`),
                      ),
                    );
                    await fs.promises.unlink(
                      path.join(process.cwd(), fileRelativePath),
                    );
                  }

                  // Cập nhật lại trạng thái đặt phòng
                  await queryRunner.manager.update(
                    Booking,
                    {
                      id: payment.booking.id,
                    },
                    {
                      status: 'confirmed',
                    },
                  );

                  // Cập nhật lại trạng thái dịch vụ đã đặt kèm (từ combo hoặc bổ sung bởi khách hàng)
                  if (payment.booking.bookingServices.length > 0) {
                    const bookingServiceEntities =
                      payment.booking.bookingServices
                        .filter(
                          (i) =>
                            i.status === 'pending' &&
                            i.createdAt.getTime() ===
                            payment.booking.createdAt.getTime(),
                        )
                        .map((item) =>
                          queryRunner.manager.create(BookingServiceEntity, {
                            ...item,
                            status: 'confirmed',
                          }),
                        );
                    await queryRunner.manager.save(bookingServiceEntities);
                  }
                } else {
                  await queryRunner.manager.update(
                    Payment,
                    vnpParams.vnp_TxnRef,
                    {
                      status: 'failed',
                      transactionCode: vnpParams.vnp_TransactionNo,
                      gatewayResponse: JSON.stringify(
                        _.omit(vnpParams, [
                          'vnp_SecureHash',
                          'vnp_SecureHashType',
                        ]),
                      ),
                    },
                  );
                }
                await queryRunner.commitTransaction();
                if (vnpParams.vnp_ResponseCode == '00') {
                  return {
                    RspCode: '00',
                    Message: 'Success',
                  };
                }
                return {
                  RspCode: vnpParams.vnp_ResponseCode,
                  Message: 'Failed',
                };
              } catch (error) {
                await queryRunner.rollbackTransaction();
                return error;
              } finally {
                await queryRunner.release();
              }
            }
            else {
              return {
                RspCode: '02',
                Message: 'This order has been updated to the payment status',
              };
            }
          } else {
            return {
              RspCode: '04',
              Message: 'Amount invalid',
            };
          }
        } else {
          return {
            RspCode: '01',
            Message: 'Order not found',
          };
        }
      } else {
        return {
          RspCode: '97',
          Message: 'Checksum failed',
        };
      }
    } catch (error) {
      return error;
    }
  }

  handleVnpReturn(handleVnpayReturnDto: HandleVnpayIpnDto) {
    return new Promise((resolve) => {
      ejs.renderFile(
        path.join(process.cwd(), 'src/assets/templates/payment-result.ejs'),
        {
          homeLink: process.env.FRONTEND_HOST,
          isSuccess: handleVnpayReturnDto.vnp_ResponseCode === '00',
        },
        (error, html) => {
          if (error) {
            resolve(error.message);
          }
          resolve(html);
        },
      );
    });
  }
}
