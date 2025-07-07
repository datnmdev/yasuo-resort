import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Repository } from 'typeorm';
import { CreateServiceReqDto } from './dtos/create-service.dto';
import { UpdateServiceReqDto } from './dtos/update-service.dto';

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

  updateService(serviceId: number, body: UpdateServiceReqDto) {
    if (Object.keys(body).length > 0) {
      return this.serviceRepository.update(
        {
          id: serviceId,
        },
        body,
      );
    }
    throw new BadRequestException('No data provided to update')
  }
}
