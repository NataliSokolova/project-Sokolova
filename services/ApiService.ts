import type { APIRequestContext, APIResponse } from '@playwright/test'; 

export class ApiService {
  protected readonly context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
  }

  static generateTimestampEmail(base: string): string {
    const ts = Date.now().toString();
    return base.replace('{{timestamp}}', ts);
  }

  
  request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options?: any
  ): Promise<APIResponse> {
    switch (method) {
      case 'GET':
        return this.context.get(endpoint, options); 
      
      case 'POST':
        return this.context.post(endpoint, options);
      
      case 'PUT':
        return this.context.put(endpoint, options);
      
      case 'DELETE':
        return this.context.delete(endpoint, options);
      
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}