import { ApiService } from './ApiService';
import type { APIResponse } from '@playwright/test'; 

export class NewsletterService extends ApiService {
  async subscribe(email: string): Promise<APIResponse> {
  
    return await this.request('POST', '/api/newsletter/subscribe', {
      data: {
        email_address: email,
        status: true
      }
    });
  }
}