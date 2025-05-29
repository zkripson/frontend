import { useEffect, useState } from "react";

function ExpiryCountdown({ createdAt }: { createdAt: number }) {
  const [remaining, setRemaining] = useState(
    24 * 60 * 60 * 1000 - (Date.now() - createdAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(24 * 60 * 60 * 1000 - (Date.now() - createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (remaining <= 0) return <span>Expired</span>;

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return (
    <span>
      {hours > 0 && `${hours}h `}
      {minutes > 0 && `${minutes}m `}
      {seconds >= 0 && `${seconds}s`}
    </span>
  );
}

export default ExpiryCountdown;
