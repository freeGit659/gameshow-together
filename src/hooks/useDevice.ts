"use client";

import { useState, useEffect } from "react";

export function useDevice() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const checkDevice = () => {
      // Kiểm tra cả user agent và viewport width
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent.toLowerCase() : "";
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 820; // Ngưỡng tablet/mobile

      setIsMobile(isSmallScreen || isMobileUA);
      setIsInitialized(true);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return { isMobile, isInitialized };
}
