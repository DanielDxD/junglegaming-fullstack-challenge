'use client';

import { env } from '@/config/env';
import React from 'react';
import { AuthProvider as OidcProvider } from 'react-oidc-context';

const oidcConfig = {
  authority: `${env.NEXT_PUBLIC_AUTH_URL}/realms/${env.NEXT_PUBLIC_AUTH_REALM}`,
  client_id: env.NEXT_PUBLIC_AUTH_CLIENT_ID,
  redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  post_logout_redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  response_type: 'code',
  scope: 'openid profile email',
  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <OidcProvider {...oidcConfig}>
      {children}
    </OidcProvider>
  );
};
