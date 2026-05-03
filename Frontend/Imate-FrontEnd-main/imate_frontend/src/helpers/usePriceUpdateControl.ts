import { differenceInDays, differenceInSeconds } from "date-fns";
import { useState, useEffect } from "react";
import { getSystemConfigByKey } from "@/services/systemConfigService";

const PRICE_UPDATE_KEY = "lastPriceUpdate";

const usePriceUpdateControl = () => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => {
    const stored = localStorage.getItem(PRICE_UPDATE_KEY);
    return stored ? new Date(stored) : null;
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [cooldownDays, setCooldownDays] = useState<number>(7);

  // Fetch cooldown days from config
  useEffect(() => {
    const fetchCooldownDays = async () => {
      try {
        const config = await getSystemConfigByKey("PRICE_UPDATE_COOLDOWN_DAYS");
        const parsed = parseInt(config.value);
        if (!isNaN(parsed)) {
          setCooldownDays(parsed);
        }
      } catch (error) {
        console.error("Failed to fetch price update cooldown days config", error);
      }
    };
    fetchCooldownDays();
  }, []);

  useEffect(() => {
    if (!lastUpdate) return;

    const cooldownPassed = differenceInDays(new Date(), lastUpdate) >= cooldownDays;
    if (cooldownPassed) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate, cooldownDays]);

  const canUpdate = !lastUpdate || differenceInDays(currentTime, lastUpdate) >= cooldownDays;

  const remainingSeconds = lastUpdate ? Math.max(0, cooldownDays * 24 * 60 * 60 - differenceInSeconds(currentTime, lastUpdate)) : 0;

  const getRemainingTimeDisplay = () => {
    if (remainingSeconds <= 0) return "Có thể cập nhật";

    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    const seconds = remainingSeconds % 60;

    if (days > 0) {
      return `Còn ${days} ngày ${hours} giờ ${minutes} phút để cập nhật`;
    } else if (hours > 0) {
      return `Còn ${hours} giờ ${minutes} phút để cập nhật`;
    } else if (minutes > 0) {
      return `Còn ${minutes}:${seconds.toString().padStart(2, "0")} để cập nhật`;
    } else {
      return `Còn ${seconds} giây để cập nhật`;
    }
  };

  const recordUpdate = () => {
    const now = new Date();
    localStorage.setItem(PRICE_UPDATE_KEY, now.toISOString());
    setLastUpdate(now);
  };

  return {
    canUpdate,
    remainingSeconds,
    remainingTimeDisplay: getRemainingTimeDisplay(),
    recordUpdate,
  };
};

export default usePriceUpdateControl;
