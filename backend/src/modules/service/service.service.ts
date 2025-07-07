import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';
import { CreateServiceReqDto } from './dtos/create-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  createService(body: CreateServiceReqDto) {
    const serviceEntity = this.serviceRepository.create(body);
    return this.serviceRepository.save(serviceEntity);
  }
}
