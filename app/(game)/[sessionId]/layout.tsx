import type { Metadata } from "next";

export const metadata: Metadata = {
  themeColor: "#2d4208",
  appleWebApp: {
    statusBarStyle: "black-translucent",
  },
};

export default function GameSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}