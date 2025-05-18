import type { Metadata } from "next";

export const metadata: Metadata = {
  themeColor: "#2d4208",
};

export default function GameSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}