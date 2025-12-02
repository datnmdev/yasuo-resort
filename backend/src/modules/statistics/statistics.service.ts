import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GetRevenueStatisticsReqDto } from './dtos/get-revenue-statistics.dto';
import { Booking } from 'modules/booking/entities/booking.entity';
import * as moment from 'moment';

@Injectable()
export class StatisticsService {
  constructor(private readonly dataSource: DataSource) {}

  async getRevenueStatistics(query: GetRevenueStatisticsReqDto) {
    const result = [];
    if (query.timeUnit === 'date') {
      const confirmedBookings = await this.dataSource.manager.find(Booking, {
        where: {
          status: 'confirmed',
        },
        relations: [
          'bookingServices',
          'bookingServices.booking',
          'payments',
          'room',
          'room.media',
          'room.type',
        ],
      });
      for (
        let i = 0;
        i <
        moment(query.endDate, 'YYYY-MM-DD').diff(
          moment(query.startDate, 'YYYY-MM-DD'),
          'days',
        ) +
          1;
        ++i
      ) {
        const item = {
          label: moment(query.startDate, 'YYYY-MM-DD')
            .clone()
            .add(i, 'days')
            .format('DD/MM/YYYY'),
          rooms: {},
        };
        const filteredConfirmedBookings = confirmedBookings.filter((cb) =>
          moment(cb.endDate, 'YYYY-MM-DD').isSame(
            moment(query.startDate, 'YYYY-MM-DD').clone().add(i, 'days'),
          ),
        );
        const expectedRevenue = filteredConfirmedBookings.reduce(
          (acc, curr) => {
            let totalNewServiceAmount = 0;
            for (const bs of curr.bookingServices.filter(
              (i) => !moment(i.createdAt).isSame(i.booking.createdAt),
            )) {
              totalNewServiceAmount +=
                bs.quantity *
                (moment(bs.endDate).diff(moment(bs.startDate), 'days') + 1) *
                Number(bs.price);
            }
            const total = acc + Number(curr.totalPrice) + totalNewServiceAmount;
            if (!item.rooms[curr.roomId]) {
              item.rooms[curr.roomId] = {
                info: curr.room,
                expectedRevenue: total,
                actualRevenue: 0,
              };
            } else {
              item.rooms[curr.roomId].expectedRevenue += total;
            }
            return total;
          },
          0,
        );
        item['expectedRevenue'] = expectedRevenue;
        const actualRevenue = filteredConfirmedBookings.reduce((acc, curr) => {
          const total = curr.payments
            .filter((p) => p.status === 'success')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
          item.rooms[curr.roomId].actualRevenue += total;
          return acc + total;
        }, 0);
        item['actualRevenue'] = actualRevenue;
        result.push(item);
      }
    } else if (query.timeUnit === 'month') {
      const confirmedBookings = await this.dataSource.manager.find(Booking, {
        where: {
          status: 'confirmed',
        },
        relations: [
          'bookingServices',
          'bookingServices.booking',
          'payments',
          'room',
          'room.media',
          'room.type',
        ],
      });
      for (
        let i = 0;
        i <
        moment(query.endDate, 'YYYY-MM').diff(
          moment(query.startDate, 'YYYY-MM'),
          'months',
        ) +
          1;
        ++i
      ) {
        const item = {
          label: moment(query.startDate, 'YYYY-MM')
            .clone()
            .add(i, 'months')
            .format('MM/YYYY'),
          rooms: {},
        };
        const filteredConfirmedBookings = confirmedBookings.filter((cb) =>
          moment(cb.endDate, 'YYYY-MM').isSame(
            moment(query.startDate, 'YYYY-MM').clone().add(i, 'months'),
          ),
        );
        const expectedRevenue = filteredConfirmedBookings.reduce(
          (acc, curr) => {
            let totalNewServiceAmount = 0;
            for (const bs of curr.bookingServices.filter(
              (i) => !moment(i.createdAt).isSame(i.booking.createdAt),
            )) {
              totalNewServiceAmount +=
                bs.quantity *
                (moment(bs.endDate).diff(moment(bs.startDate), 'days') + 1) *
                Number(bs.price);
            }
            const total = Number(curr.totalPrice) + totalNewServiceAmount;
            if (!item.rooms[curr.roomId]) {
              item.rooms[curr.roomId] = {
                info: curr.room,
                expectedRevenue: total,
                actualRevenue: 0,
              };
            } else {
              item.rooms[curr.roomId].expectedRevenue += total;
            }
            return acc + total;
          },
          0,
        );
        item['expectedRevenue'] = expectedRevenue;
        const actualRevenue = filteredConfirmedBookings.reduce((acc, curr) => {
          const total = curr.payments
            .filter((p) => p.status === 'success')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
          item.rooms[curr.roomId].actualRevenue += total;
          return acc + total;
        }, 0);
        item['actualRevenue'] = actualRevenue;
        result.push(item);
      }
    } else {
      const confirmedBookings = await this.dataSource.manager.find(Booking, {
        where: {
          status: 'confirmed',
        },
        relations: [
          'bookingServices',
          'bookingServices.booking',
          'payments',
          'room',
          'room.media',
          'room.type',
        ],
      });
      for (
        let i = 0;
        i <
        moment(query.endDate, 'YYYY').diff(
          moment(query.startDate, 'YYYY'),
          'years',
        ) +
          1;
        ++i
      ) {
        const item = {
          label: moment(query.startDate, 'YYYY')
            .clone()
            .add(i, 'years')
            .format('YYYY'),
          rooms: {},
        };
        const filteredConfirmedBookings = confirmedBookings.filter((cb) =>
          moment(cb.endDate, 'YYYY').isSame(
            moment(query.startDate, 'YYYY').clone().add(i, 'years'),
          ),
        );
        const expectedRevenue = filteredConfirmedBookings.reduce(
          (acc, curr) => {
            let totalNewServiceAmount = 0;
            for (const bs of curr.bookingServices.filter(
              (i) => !moment(i.createdAt).isSame(i.booking.createdAt),
            )) {
              totalNewServiceAmount +=
                bs.quantity *
                (moment(bs.endDate).diff(moment(bs.startDate), 'days') + 1) *
                Number(bs.price);
            }
            const total = Number(curr.totalPrice) + totalNewServiceAmount;
            if (!item.rooms[curr.roomId]) {
              item.rooms[curr.roomId] = {
                info: curr.room,
                expectedRevenue: total,
                actualRevenue: 0,
              };
            } else {
              item.rooms[curr.roomId].expectedRevenue += total;
            }
            return acc + total;
          },
          0,
        );
        item['expectedRevenue'] = expectedRevenue;
        const actualRevenue = filteredConfirmedBookings.reduce((acc, curr) => {
          const total = curr.payments
            .filter((p) => p.status === 'success')
            .reduce((acc, curr) => acc + Number(curr.amount), 0);
          item.rooms[curr.roomId].actualRevenue += total;
          return acc + total;
        }, 0);
        item['actualRevenue'] = actualRevenue;
        result.push(item);
      }
    }
    return result.map((i) => ({
      ...i,
      expectedRevenue: i.expectedRevenue.toFixed(2),
      actualRevenue: i.actualRevenue.toFixed(2),
      rooms: Object.entries(i.rooms).map(([_, value]) => ({
        ...(value as any),
        expectedRevenue: (value as any).expectedRevenue.toFixed(2),
        actualRevenue: (value as any).actualRevenue.toFixed(2),
      })),
    }));
  }
}
