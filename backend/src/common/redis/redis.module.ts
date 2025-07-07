import { DynamicModule, Module } from '@nestjs/common';
import { RedisConnectorService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';
import { RedisOptions } from './redis.type';

@Module({})
export class RedisModule {
  static forRoot(options: RedisOptions): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      providers: [
        RedisConnectorService,
        {
          provide: REDIS_CLIENT,
          useFactory: async (connector: RedisConnectorService) => {
            return await connector.create(options);
          },
          inject: [RedisConnectorService],
        },
      ],
      exports: [REDIS_CLIENT],
    };
  }
}
