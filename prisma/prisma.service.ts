import { PrismaClient } from '@prisma/client';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  $queryRaw: any;
    private _orderStatus: any;
  $client: any;
  public get orderStatus(): any {
    return this._orderStatus;
  }
  public set orderStatus(value: any) {
    this._orderStatus = value;
  }
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

 
  
}