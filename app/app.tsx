"use client";

import useConnectToFarcaster from "@/hooks/useConnectToFarcaster";

export default function RootApp({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {} = useConnectToFarcaster();

  return children;
}
