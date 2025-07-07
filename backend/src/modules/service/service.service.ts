import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { QueryFailedError, Repository } from 'typeorm';
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

  async deleteService(serviceId: number) {
    try {
      const deleteResult = await this.serviceRepository.delete({
        id: serviceId,
      });
      return deleteResult;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException({
          error: 'DeleteConflict',
          message: 'Cannot delete because the data is being used elsewhere',
        });
      }
      throw error;
    }
  }
}
