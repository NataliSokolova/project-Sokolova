import { APIRequestContext } from '@playwright/test';
import { test, expect } from '@playwright/test';


async function createTempUserAndArticle({ request }) {
  const timestamp = Date.now();


  const userData = {
    user: {
      username: `playwright_user_${timestamp}`,
      email: `playwright_user_${timestamp}@example.com`,
      password: 'StrongPassw0rd!'
    }
  };

  
  const regResponse = await request.post('/api/users', { data: userData });
  if (!regResponse.ok()) throw new Error(`Регистрация провалилась: ${await regResponse.text()}`);

  
  const regBody = await regResponse.json(); 
  const token = regBody.user.token;

  
  const articlePayload = {
    article: {
      title: `Temp Article for Test #7 & #8 ${Date.now()}`,
      description: 'This is a temporary article created by Playwright.', 
      body: 'Lorem ipsum dolor sit amet...', 
      tagList: ['testing']
    }
  };

  const createResponse = await request.post('/api/articles', {
    headers: { Authorization: `Token ${token}` },
    data: articlePayload,
  });

  console.log('Временная статья:', await createResponse.text());

  
  expect(createResponse.status()).toBe(201);

  
  const createdArticle = await createResponse.json();
  const mySlug = createdArticle.article.slug; 

  return { token, mySlug, regBody }; 
}


test('Можно зарегистрировать нового пользователя', async ({ request }) => {
  console.log('Запуск теста #1');

  const timestamp = Date.now(); 

  
  const userData = {
    user: {
      username: `playwright_user_${timestamp}`,
      email: `playwright_user_${timestamp}@example.com`,
      password: 'StrongPassw0rd!' 
    }
  };

  
  const response = await request.post('/api/users', {
    data: userData,
  });

  console.log('Ответ регистрации:', await response.text()); 

  expect(response.ok()).toBe(true); 
  expect(response.status()).toBe(201); 

  
  const body = await response.json();
  expect(body.user.token).toBeDefined(); 
});


test('Автор может создать новую статью', async ({ request }) => {
  console.log('Запуск теста #2');

  let token;
  {
    const timestamp = Date.now();
    const userData = {
      user: {
        username: `playwright_user_${timestamp}`,
        email: `playwright_user_${timestamp}@example.com`,
        password: 'StrongPassw0rd!'
      }
    };
    
    const regResponse = await request.post('/api/users', { data: userData });
    const regBody = await regResponse.json();
    token = regBody.user.token;
  }


  const articlePayload = {
    article: {
      title: `Test Article ${Date.now()}`,
      description: 'This is a test.',
      body: 'Lorem ipsum...',
      tagList: ['testing']
    }
  };

 
  const createResponse = await request.post('/api/articles', {
    headers: {
      Authorization: `Token ${token}` 
    },
    data: articlePayload,
  });

  console.log('Ответ создания:', await createResponse.text());

  
  expect(createResponse.ok()).toBe(true);
  expect(createResponse.status()).toBe(201); 

  const createdArticle = await createResponse.json();
  expect(createdArticle.article.title).toContain('Test');
});


test('Должен вернуть список всех статей', async ({ request }) => {
  console.log('Запуск теста #3');

  const response = await request.get('/api/articles'); 

  console.log('Список статей:', await response.text());

  
  expect(response.ok()).toBe(true);
  expect(response.status()).toBe(200);

  const articles = await response.json();
  expect(articles).toMatchObject({
    articlesCount: expect.any(Number),
  }); 
});


test('Поиск должен возвращать результаты', async ({ request }) => {
  console.log('Запуск теста #4');


  const response = await request.get('/api/articles?tag=testing'); 

  console.log('Результаты поиска:', await response.text());

  expect(response.ok()).toBe(true);
  expect(response.status()).toBe(200);

  const result = await response.json();
  expect(result).toMatchObject({
    articles: expect.anything(), 
    articlesCount: expect.any(Number),
  });

  
  if (Array.isArray(result.articles)) {
    for (const article of result.articles) {
      
      let tags = Array.isArray(article.tagList)
        ? article.tagList
        : [article.tagList];
      
      expect(tags.includes('testing')).toBe(true);
    }
  }
});


test('Автор может видеть свои любимые статьи', async ({ request }) => {
  console.log('Запуск теста #6');

 
  const { token } = await createTempUserAndArticle({ request });


  const feedResponse = await request.get('/api/articles/feed', {
    headers: { Authorization: `Token ${token}` }
  });

  console.log('Мой любимый контент:', await feedResponse.text());

  
  expect(feedResponse.ok()).toBe(true);
  expect(feedResponse.status()).toBe(200);

  const feed = await feedResponse.json();
  expect(feed).toMatchObject({
    articles: expect.arrayContaining([]), 
    articlesCount: expect.any(Number),
  });
});


test('Автор может обновить свою статью', async ({ request }) => {
  console.log('Запуск теста #7');

  
  const { token, mySlug } = await createTempUserAndArticle({ request });

  
  const updateResponse = await request.put(`/api/articles/${mySlug}`, {
    headers: { Authorization: `Token ${token}` },
    data: {
      article: {
        title: `[UPDATED] Test Article`
      }
    }
  });

  console.log('Обновление:', await updateResponse.text());

  expect(updateResponse.ok()).toBe(true);
  expect(updateResponse.status()).toBe(200);

  const updatedArticle = await updateResponse.json();
  expect(updatedArticle.article.title).toContain('[UPDATED]');
});


test('Автор может удалить свою статью', async ({ request }) => {
  console.log('Запуск теста #8');

  
  const { token, mySlug } = await createTempUserAndArticle({ request });

  const deleteResponse = await request.delete(`/api/articles/${mySlug}`, {
    headers: { Authorization: `Token ${token}` }
  });

  console.log('Удаление:');

  
  expect(deleteResponse.ok()).toBe(true);
  expect(deleteResponse.status()).toBe(200); 
}); 


test('Пользователь может увидеть статьи с тэгом "testing"', async ({ request }) => {
  console.log('Запуск теста #9');

  
  const response = await request.get('/api/articles?tag=testing'); 

  console.log('Статьи:', await response.text());

  expect(response.status()).toBe(200);

  const result = await response.json();
  expect(result).toMatchObject({
    articles: expect.anything(), 
    articlesCount: expect.any(Number),
  });

  
  if (result.articles !== null && Array.isArray(result.articles)) {
    for (const article of result.articles) {
      let tags = Array.isArray(article.tagList)
        ? article.tagList
        : [article.tagList];
      
      expect(tags.includes('testing')).toBe(true); 
    }
  }
});


test('Пользователь может получить список популярных тегов', async ({ request }) => {
  console.log('Запуск теста #10');


  const response = await request.get('/api/tags'); 

  console.log('Список тегов:', await response.text());

  expect(response.status()).toBe(200);

  const result = await response.json();
  
  
  expect(result.tags).toEqual(expect.arrayContaining([])); 
});