import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'ja', 'en'],
  defaultLocale: 'zh',
});
