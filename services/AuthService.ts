import type { APIResponse, APIRequestContext } from '@playwright/test';
import { ApiService } from './ApiService';

export class AuthService extends ApiService {
  private token: string | null = null;

  constructor(context: APIRequestContext) {
    super(context); 
  }

  async requestWithAuth(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options?: any
  ): Promise<APIResponse> {
    const headers = { Authorization: `Token ${this.getToken()}` }; 
    
    switch (method.toLowerCase()) {
      case 'get':
        return this.context.get(url, { ...options, headers });
      
      case 'post':
        return this.context.post(url, { ...options, headers });
      
      case 'put':
        return this.context.put(url, { ...options, headers });
      
      case 'delete':
        return this.context.delete(url, { ...options, headers });
      
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  getToken(): string {
    if (!this.token) throw new Error('Not logged in!');
    return this.token;
  }

  
  async login(email: string, password: string): Promise<string> {
    const payload = { user: { email, password } };

    const res = await this.context.post('/api/users/login', { data: payload });

    if (!res.ok()) {
      console.error(await res.text()); 
      throw new Error(`Login failed with status ${res.status()}`);
    }

    const authResponse = await res.json();
    this.token = authResponse.user.token!; 
    return this.token!; 
  }


  async register(userData: any): Promise<string> {
    const response = await this.requestWithAuth('POST', '/api/users', userData);

    if (!response.ok()) {
      console.error(await response.text());
      throw new Error(`Registration failed with status ${response.status()}`);
    }

    const body = await response.json();
    this.token = body.user.token!; 
    return this.token!; 
  }
}