import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ComboService } from './combo.service';
import { Roles } from 'common/decorators/roles.decorator';
import { Role } from 'common/constants/user.constants';
import { RolesGuard } from 'common/guards/roles.guard';
import { CreateComboReqDto } from './dtos/create-combo.dto';
import { PublicationComboReqDto } from './dtos/publication-combo.dto';
import { AppResponse } from 'common/http/wrapper.http';
import { GetComboForAdminReqDto, GetComboReqDto } from './dtos/get-combo.dto';
import { UpdateComboReqDto } from './dtos/update-combo.dto';

@Controller('combo')
export class ComboController {
  constructor(private readonly comboService: ComboService) {}

  @Get()
  async getCombos(@Query() query: GetComboReqDto) {
    return AppResponse.ok(await this.comboService.getCombos(query));
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getCombosForAdmin(@Query() query: GetComboForAdminReqDto) {
    return AppResponse.ok(await this.comboService.getCombosForAdmin(query));
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createCombo(@Body() body: CreateComboReqDto) {
    return AppResponse.ok(await this.comboService.createCombo(body));
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateCombo(
    @Param('id') id: number,
    @Body() updateComboBody: UpdateComboReqDto,
  ) {
    return AppResponse.ok(
      await this.comboService.updateCombo(id, updateComboBody),
    );
  }

  @Put('publication/:id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async publicationCombo(
    @Param('id') id: number,
    @Body() publicationVoucherBody: PublicationComboReqDto,
  ) {
    return AppResponse.ok(
      await this.comboService.publicationCombo(
        id,
        publicationVoucherBody.isActive,
      ),
    );
  }
}
