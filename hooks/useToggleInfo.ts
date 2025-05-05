"use client";

import { useState, useEffect } from "react";

export function useToggleInfo(intervalMs: number = 30000) {
  const [infoShow, setInfoShow] = useState<boolean>(true);
  const [userDismissedInfo, setUserDismissedInfo] = useState<boolean>(false);

  useEffect(() => {
    // if user explicitly dismissed, hide permanently
    if (userDismissedInfo) {
      setInfoShow(false);
      return;
    }

    // else toggle every intervalMs
    const interval = setInterval(() => {
      setInfoShow((prev) => !prev);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [userDismissedInfo, intervalMs]);

  return { infoShow, userDismissedInfo, setUserDismissedInfo };
}
