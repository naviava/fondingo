"use client";

import { ModalProvider } from "./modal-provider";
import { TRPCProvider } from "./trpc-provider";

interface IProps {
  children: React.ReactNode;
}

export function Providers({ children }: IProps) {
  return (
    <TRPCProvider>
      <ModalProvider />
      {children}
    </TRPCProvider>
  );
}
