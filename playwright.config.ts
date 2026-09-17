import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://natalikristal-188.130.251.61.sslip.io',
  },
  
  reporter: [['html', { open: 'always' }]], // <— Эта строчка открывает отчёт всегда
});