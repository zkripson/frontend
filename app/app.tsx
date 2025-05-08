"use client";

import { KPToastNotification } from "@/components";
import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";

export default function RootApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {} = useConnectToFarcaster();

  return (
    <>
      {children}
      <KPToastNotification />
    </>
  );
}
