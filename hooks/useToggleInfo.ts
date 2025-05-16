"use client";

import { useState, useEffect } from "react";

export function useToggleInfo() {
  const [infoShow, setInfoShow] = useState<boolean>(false);
  const [userDismissedInfo, setUserDismissedInfo] = useState<boolean>(false);

  useEffect(() => {
    if (userDismissedInfo) {
      setInfoShow(false);
      return;
    }
    const showTimeout = setTimeout(() => {
      setInfoShow(true);
      const hideTimeout = setTimeout(() => {
        setInfoShow(false);
      }, 5000);
      return () => clearTimeout(hideTimeout);
    }, 5000);
    return () => clearTimeout(showTimeout);
  }, [userDismissedInfo]);

  return { infoShow, userDismissedInfo, setUserDismissedInfo };
}
