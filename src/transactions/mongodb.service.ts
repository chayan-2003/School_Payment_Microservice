import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MongodbService implements OnModuleInit {
  private client: MongoClient;
  private db: Db;

  async onModuleInit() {
    const mongoUri = process.env.mongo_uri;
    if (!mongoUri) {
      throw new Error('Environment variable mongo_uri is not defined');
    }
    this.client = new MongoClient(mongoUri); 
    await this.client.connect();
    this.db = this.client.db('booking'); 
  }

  getCollection(collectionName: string) {
    return this.db.collection(collectionName);
  }
}
