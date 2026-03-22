import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// next-auth redirects unauthenticated users to /auth/signin (no locale).
// We detect the preferred locale and redirect to the localized signin page.
export default async function SignInRedirect() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  let locale = 'zh'; // default
  if (acceptLanguage.startsWith('ja')) locale = 'ja';
  else if (acceptLanguage.startsWith('en')) locale = 'en';
  
  redirect(`/${locale}/auth/signin`);
}
