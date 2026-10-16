"use client";

import React, { useState, useEffect } from "react";
import { useDevice } from "@/hooks/useDevice";
import { DesktopHomeView } from "@/components/desktop/DesktopHomeView";
import { MobileHomeView } from "@/components/mobile/MobileHomeView";
import { DEFAULT_PACKS } from "@/lib/questions";
import { CreatorPack } from "@/types/game";

export default function AdaptiveHomePage() {
  const { isMobile, isInitialized } = useDevice();
  const [packs, setPacks] = useState<CreatorPack[]>(DEFAULT_PACKS);

  useEffect(() => {
    const savedPacks = localStorage.getItem("gst_creator_packs");
    if (savedPacks) {
      try {
        setPacks([...DEFAULT_PACKS, ...JSON.parse(savedPacks)]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSavePack = (newPack: CreatorPack) => {
    const updated = [newPack, ...packs];
    setPacks(updated);
    const customOnly = updated.filter((p) => !p.isOfficial);
    localStorage.setItem("gst_creator_packs", JSON.stringify(customOnly));
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-current border-t-transparent animate-spin opacity-40" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileHomeView
        packs={packs}
        onSavePack={handleSavePack}
      />
    );
  }

  return (
    <DesktopHomeView
      packs={packs}
      onSavePack={handleSavePack}
    />
  );
}
