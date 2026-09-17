import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ApiService } from './ApiService'; 
import { AuthService } from './AuthService'; 


export class ArticleService extends ApiService {
  constructor(context: APIRequestContext) {
    super(context); 
  }

 
  async getArticles(): Promise<APIResponse> {
    return this.context.get('/api/articles');
  }

  
  async search(query: Record<string, string>): Promise<APIResponse> {
    const params = new URLSearchParams(); 
    
    for (const [key, value] of Object.entries(query)) {
      params.append(key, value);
    }

    return this.context.get(`/api/articles?${params}`);
  }

  
  async createArticle(articleData: any, authService: AuthService): Promise<APIResponse> {
    const token = await authService.getToken();

    
    return this.context.post('/api/articles', {
      headers: {
        Authorization: `Token ${token}` 
      },
      data: {
        article: articleData,
      }
    });
  }

  
  async addComment(slug: string, commentBody: string, authService: AuthService): Promise<APIResponse> {
    const token = await authService.getToken();

    return this.context.post(`/api/articles/${slug}/comments`, {
      headers: {
        Authorization: `Token ${token}`
      },
      data: {
        comment: {
          body: commentBody,
        },
      },
    });
  }

 
  async subscribe(email: string): Promise<APIResponse> {
    return this.context.post('/api/newsletter/subscribe', {
      data: {
        email_address: email,
        status: true,
      },
    });
  }
}