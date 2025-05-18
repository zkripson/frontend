export async function POST(req: Request) {
  const data = await req.json();

  // Extract the original URL that was framed (includes any game code)
  const originalUrl = data.untrustedData?.url || "";
  let redirectUrl = "https://app.bship.fun"; // Default homepage

  // Check if there's a game code in the original URL
  const match = originalUrl.match(/\/join-game\?code=([^&]+)/);
  if (match && match[1]) {
    // If found, redirect to the join-game page with the code
    redirectUrl = `https://app.bship.fun/join-game?code=${match[1]}`;
  }

  // Return a response that includes where to redirect
  return new Response(
    JSON.stringify({
      redirect: redirectUrl,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
