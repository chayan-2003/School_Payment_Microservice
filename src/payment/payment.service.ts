import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { CreatePaymentDto } from './dto/payment.dto'; // Adjust the import path as necessary

@Injectable()
export class PaymentsService {
  constructor(private readonly httpService: HttpService) { }

  async createPayment(dto: CreatePaymentDto): Promise<any> {
    const pgKey = process.env.PG_SECRET_KEY || ''; // Get the PG Secret Key from environment variables
    const apiKey =
      process.env.PG_API_KEY || ''; // Get the PG API Key from environment variables

    // Prepare the payload to be signed
    const signPayload = {
      school_id: dto.school_id, // Use school_id from the DTO
      amount: dto.amount,
      callback_url: dto.callback_url,
    };

    // Sign the payload using the PG Secret Key
    const sign = jwt.sign(signPayload, pgKey);

    // Prepare the request body for Create Collect Request API
    const requestBody = {
      school_id: dto.school_id, // Use school_id from the DTO
      amount: dto.amount,
      callback_url: dto.callback_url,
      sign,
    };

    const url = 'https://dev-vanilla.edviron.com/erp/create-collect-request';

    try {
      // Send POST request to Create Collect Request API
      const response = await lastValueFrom(
        this.httpService.post(url, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey ? `Bearer ${apiKey}` : '', // Safely add Bearer token
          },
        }),
      );


      // Return the collect_request_url and sign from the response
      return {
        collect_request_id: response.data.collect_request_id,
        collect_request_url: response.data.collect_request_url,
        sign: response.data.sign,
      };
    } catch (error) {
      // Handle errors and provide meaningful feedback
      throw new Error(
        `Failed to create payment: ${error instanceof Error ? (error as any).response?.data?.message || error.message : 'Unknown error'}`,
      );
    }
  }
}