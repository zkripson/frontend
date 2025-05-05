import { useState, useEffect } from "react";

interface ScreenType {
  isXSmall: boolean; // <= 431px
  isSmall: boolean; // > 431px && <= 769px
  isMedium: boolean; // > 769px && <= 1025px
  isLarge: boolean; // > 1025px && <= 1281px
  isXLarge: boolean; // > 1281px && <= 1537px
  is2XLarge: boolean; // > 1537px
}

const breakpoints = {
  xsmall: 431,
  small: 769,
  medium: 1025,
  large: 1281,
  xlarge: 1537,
};

export const useScreenDetect = (): ScreenType => {
  const [screen, setScreen] = useState<ScreenType>({
    isXSmall: false,
    isSmall: false,
    isMedium: false,
    isLarge: false,
    isXLarge: false,
    is2XLarge: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setScreen({
        isXSmall: width <= breakpoints.xsmall,
        isSmall: width > breakpoints.xsmall && width <= breakpoints.small,
        isMedium: width > breakpoints.small && width <= breakpoints.medium,
        isLarge: width > breakpoints.medium && width <= breakpoints.large,
        isXLarge: width > breakpoints.large && width <= breakpoints.xlarge,
        is2XLarge: width > breakpoints.xlarge,
      });
    };

    // initialize
    if (typeof window !== "undefined") handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screen;
};
