"use client";

import React, { useState, useEffect } from "react";
import { useDevice } from "@/hooks/useDevice";
import { DesktopHomeView } from "@/components/desktop/DesktopHomeView";
import { MobileHomeView } from "@/components/mobile/MobileHomeView";
import { DEFAULT_PACKS } from "@/lib/questions";
import { CreatorPack } from "@/types/game";

export default function AdaptiveHomePage() {
  const { isMobile, isInitialized } = useDevice();

  const [playerName, setPlayerName] = useState("Pablo");
  const [packs, setPacks] = useState<CreatorPack[]>(DEFAULT_PACKS);

  useEffect(() => {
    const savedName = localStorage.getItem("gst_player_name");
    if (savedName) {
      setPlayerName(savedName);
    } else {
      setPlayerName("Pablo");
      localStorage.setItem("gst_player_name", "Pablo");
    }

    const savedPacks = localStorage.getItem("gst_creator_packs");
    if (savedPacks) {
      try {
        setPacks([...DEFAULT_PACKS, ...JSON.parse(savedPacks)]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleUpdateName = (name: string) => {
    setPlayerName(name);
    localStorage.setItem("gst_player_name", name);
  };

  const handleSavePack = (newPack: CreatorPack) => {
    const updated = [newPack, ...packs];
    setPacks(updated);
    const customOnly = updated.filter((p) => !p.isOfficial);
    localStorage.setItem("gst_creator_packs", JSON.stringify(customOnly));
  };

  // Tránh flash layout trước khi detect xong
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-current border-t-transparent animate-spin opacity-40" />
      </div>
    );
  }

  // Tự động chọn giao diện tối ưu: Mobile UI trên điện thoại, Desktop Gaming Dashboard trên máy tính!
  if (isMobile) {
    return (
      <MobileHomeView
        playerName={playerName}
        onUpdatePlayerName={handleUpdateName}
        packs={packs}
        onSavePack={handleSavePack}
      />
    );
  }

  return (
    <DesktopHomeView
      playerName={playerName}
      onUpdatePlayerName={handleUpdateName}
      packs={packs}
      onSavePack={handleSavePack}
    />
  );
}
