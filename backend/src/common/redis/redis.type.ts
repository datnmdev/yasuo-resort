import { createClient } from 'redis';

export interface RedisOptions {
  host: string;
  port: number;
  password: string;
}

export type RedisClient = ReturnType<typeof createClient>;
