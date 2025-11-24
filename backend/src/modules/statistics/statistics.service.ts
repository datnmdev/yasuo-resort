import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { GetRevenueStatisticsReqDto } from "./dtos/get-revenue-statistics.dto";

@Injectable()
export class StatisticsService {
  constructor(
    private readonly dataSource: DataSource
  ) {}

  async getRevenueStatistics(query: GetRevenueStatisticsReqDto) {
    
  }
}