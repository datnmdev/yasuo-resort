import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { Brackets, QueryFailedError, Repository } from 'typeorm';
import { CreateServiceReqDto } from './dtos/create-service.dto';
import { UpdateServiceReqDto } from './dtos/update-service.dto';
import { GetServiceReqDto } from './dtos/get-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  getServices(query: GetServiceReqDto) {
    return this.serviceRepository
      .createQueryBuilder('service')
      .where(
        new Brackets((qb) => {
          if (query.keyword) {
            qb.where('MATCH(name) AGAINST (:name IN BOOLEAN MODE)', {
              name: query.keyword,
            });
            if (!isNaN(Number(query.keyword))) {
              qb.orWhere('service.id = :id', {
                id: Number(query.keyword),
              });
            }
          }
        }),
      )
      .orderBy('service.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

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
    throw new BadRequestException('No data provided to update');
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
