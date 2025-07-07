import { Injectable } from '@nestjs/common';
import { RedisOptions } from './redis.type';
import { createClient } from 'redis';

@Injectable()
export class RedisConnectorService {
  async create(options: RedisOptions) {
    const client = createClient({
      password: options.password,
      socket: {
        host: options.host,
        port: options.port,
      },
    });

    await client
      .on('error', function () {
        console.log('Redis connect error!');
      })
      .on('reconnecting', function () {
        console.log('Redis reconnecting...');
      })
      .on('connect', function () {
        console.log('Redis connect...');
      })
      .on('ready', function () {
        console.log('Redis connected! Cache Service is Working...');
      })
      .connect();
    return client;
  }
}
