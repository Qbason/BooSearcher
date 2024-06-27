'use client';

import { NextUIProvider } from '@nextui-org/react';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextUIProvider className="min-h-screen flex flex-col">
      {children}
    </NextUIProvider>
  );
};
