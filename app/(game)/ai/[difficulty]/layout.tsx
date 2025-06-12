import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#2d4208",
};

export default function GameSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}