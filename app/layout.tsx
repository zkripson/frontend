import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Providers from "@/providers";
import "./globals.css";
import RootApp from "./app";
import { AudioProvider } from "@/providers/AudioProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Battleship",
  description:
    "Battleship is a game of strategy and skill. Play against other players to earn rewards.",
  keywords: [
    "Battleship",
    "Game",
    "Strategy",
    "Skill",
    "Rewards",
    "Blockchain",
    "Crypto",
    "Multiplayer",
    "Online",
    "Fun",
    "Entertainment",
    "Blockchain Game",
    "Blockchain Gaming",
  ],
  applicationName: "Battleship",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Battleship",
  },
  openGraph: {
    title: "Battleship",
    description:
      "Battleship is a game of strategy and skill. Play against other players to earn rewards.",
    url: "https://app.bship.fun",
    type: "website",
    images: [
      {
        url: "https://app.bship.fun/game-preview-bg.png",
        width: 1200,
        height: 630,
      },
    ],
    siteName: "app.bship.fun",
  },
  twitter: {
    card: "summary_large_image",
    site: "https://app.bship.fun",
    title: "Battleship",
    description:
      "Battleship is a game of strategy and skill. Play against other players to earn rewards.",
    images: [
      {
        url: "https://app.bship.fun/game-preview-bg.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#d9b478",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="fc:frame"
          content='{
            "version": "next",
            "imageUrl": "https://app.bship.fun/game-preview-bg.png",
            "button":{
              "title": "Play Now",
              "action": {
                "type": "launch_frame",
                "name": "Battleship",
                "url": "https://app.bship.fun",
                "splashImageUrl": "https://app.bship.fun/logo-bg.png",
                "iconUrl": "https://app.bship.fun/logo-bg.png",
                "splashBackgroundColor": "#20262D"
              }
            }
          }'
        />
        <meta property="fc:frame:wallet_action" content="use_warpcast" />
        <meta property="fc:frame:button:1" content="Play now" />
        <meta property="fc:frame:button:1:action" content="post_redirect" />
        <meta
          property="fc:frame:post_url"
          content="https://app.bship.fun/api/frame-handler"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/** Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2KVQZPTCVM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-2KVQZPTCVM');
        `}
        </Script>

        <Providers>
          <AudioProvider>
            <RootApp>{children}</RootApp>
          </AudioProvider>
        </Providers>
      </body>
    </html>
  );
}
