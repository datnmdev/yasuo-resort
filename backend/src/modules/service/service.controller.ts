import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { CreateServiceReqDto } from './dtos/create-service.dto';
import { AppResponse } from 'common/http/wrapper.http';
import { UpdateServiceReqDto } from './dtos/update-service.dto';
import { GetServiceReqDto } from './dtos/get-service.dto';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  async getServices(@Query() getServiceQuery: GetServiceReqDto) {
    return AppResponse.ok(await this.serviceService.getServices(getServiceQuery))
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createService(@Body() createServiceBody: CreateServiceReqDto) {
    return AppResponse.ok(
      await this.serviceService.createService(createServiceBody),
    );
  }

  @Put(':serviceId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateService(
    @Param('serviceId') serviceId: number,
    @Body() updateServiceBody: UpdateServiceReqDto,
  ) {
    return AppResponse.ok(
      await this.serviceService.updateService(serviceId, updateServiceBody),
    );
  }

  @Delete(':serviceId')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteService(
    @Param('serviceId') serviceId: number
  ) {
    return AppResponse.ok(
      await this.serviceService.deleteService(serviceId),
    );
  }
}
