import React, { type PropsWithChildren } from 'react';
import { type InitialProps } from '@granite-js/react-native';
import { AppsInToss } from '@apps-in-toss/framework';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TDSProvider } from '@toss/tds-react-native';
import { context } from '../require.context';
import { AppSessionProvider } from 'providers/AppSessionProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return (
    <TDSProvider colorPreference="light" fontScaleAvailable>
      <QueryClientProvider client={queryClient}>
        <AppSessionProvider>{children}</AppSessionProvider>
      </QueryClientProvider>
    </TDSProvider>
  );
}

export default AppsInToss.registerApp(AppContainer, {
  context,
  analytics: {
    debug: __DEV__,
  },
});
