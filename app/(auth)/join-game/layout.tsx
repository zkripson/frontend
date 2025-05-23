export default function JoinLayout({
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
              "title": "Join Game",
              "action": {
                "type": "launch_frame",
                "name": "Battleship",
                "splashImageUrl": "https://app.bship.fun/logo-bg.png",
                "iconUrl": "https://app.bship.fun/logo-bg.png",
                "splashBackgroundColor": "#20262D"
              }
            }
          }'
        />
        <meta property="fc:frame:wallet_action" content="use_warpcast" />
        <meta property="fc:frame:button:1" content="Join Game" />
        <meta property="fc:frame:button:1:action" content="post_redirect" />
      </head>

      <body>{children}</body>
    </html>
  );
}
