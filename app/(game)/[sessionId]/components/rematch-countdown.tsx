import { useEffect, useState } from "react";

function RematchCountdown() {
  const [secondsLeft, setSecondsLeft] = useState<number>(11);

  useEffect(() => {
    if (secondsLeft > 0) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [secondsLeft]);

  return (
    <div className="flex items-center justify-center mt-2 text-[min(9vw,24px)] relative">
      <span className="text-primary-250 font-semibold mr-2">Rematch in:</span>
      <span className="text-primary-50 font-bold text-lg">{secondsLeft}</span>
      <div className="absolute inset-0 rounded-full bg-primary-50/90 blur-xl animate-ping w-[50%] left-[25%]" />
    </div>
  );
}

export default RematchCountdown;
