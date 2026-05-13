"use client";

import { useEffect, useMemo, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const WINDOWS_PER_DAY = 24 * 60;

const clamp = (min: number, max: number, value: number) =>
  Math.max(min, Math.min(max, value));

const hashInt = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const parseLocalDateStart = (dateString: string) => {
  const [y, m, d] = dateString.split("-").map((part) => Number(part));
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0).getTime();
};

const getLocalDayStart = (ts: number) => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const getDayIndex = (nowMs: number, anchorDate: string) => {
  const anchorMs = parseLocalDateStart(anchorDate);
  const todayMs = getLocalDayStart(nowMs);
  return Math.max(0, Math.floor((todayMs - anchorMs) / DAY_MS));
};

const getDailyIncrease = (anchorDate: string, dayIndex: number) => {
  const variation = (hashInt(`${anchorDate}-${dayIndex}`) % 41) - 20; // -20..20
  return clamp(60, 120, Math.round(85 + variation));
};

const getDayStartTotal = (
  anchorDate: string,
  baseCount: number,
  dayIndex: number,
) => {
  let total = baseCount;
  for (let d = 0; d < dayIndex; d += 1) {
    total += getDailyIncrease(anchorDate, d);
  }
  return total;
};

const getIntradayProgress = (
  anchorDate: string,
  dayIndex: number,
  dayIncrease: number,
  elapsedMs: number,
) => {
  const safeElapsed = clamp(0, DAY_MS - 1, elapsedMs);
  const currentWindow = Math.min(
    WINDOWS_PER_DAY - 1,
    Math.floor(safeElapsed / MINUTE_MS),
  );

  let totalWeight = 0;
  let elapsedWeight = 0;

  // Deterministic minute-level pacing across the day.
  for (let i = 0; i < WINDOWS_PER_DAY; i += 1) {
    const weight = 1 + (hashInt(`${anchorDate}-${dayIndex}-w-${i}`) % 3); // 1..3
    totalWeight += weight;
    if (i <= currentWindow) elapsedWeight += weight;
  }

  if (totalWeight <= 0) return 0;

  return clamp(
    0,
    dayIncrease,
    Math.floor((dayIncrease * elapsedWeight) / totalWeight),
  );
};

type DailyPatientCounterResult = {
  displayCount: number;
  dayTarget: number;
  dayIncrease: number;
};

export default function useDailyPatientCounter(
  anchorDate: string,
  baseCount: number,
): DailyPatientCounterResult {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(baseCount);

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const computed = useMemo(() => {
    if (nowMs === null) {
      return { displayCount: baseCount, dayTarget: baseCount, dayIncrease: 0 };
    }

    const dayIndex = getDayIndex(nowMs, anchorDate);
    const dayIncrease = getDailyIncrease(anchorDate, dayIndex);
    const dayStartTotal = getDayStartTotal(anchorDate, baseCount, dayIndex);
    const dayStartMs = getLocalDayStart(nowMs);
    const elapsedMs = nowMs - dayStartMs;

    // Day target is the full expected total by end of today.
    const dayTarget = dayStartTotal + dayIncrease;
    // Intraday pacing simulates purchases throughout the day.
    const intradayAdded = getIntradayProgress(
      anchorDate,
      dayIndex,
      dayIncrease,
      elapsedMs,
    );
    const pacedCount = clamp(dayStartTotal, dayTarget, dayStartTotal + intradayAdded);

    return { displayCount: pacedCount, dayTarget, dayIncrease };
  }, [anchorDate, baseCount, nowMs]);

  useEffect(() => {
    // Never decrease in-session; never exceed computed day target.
    setDisplayCount((prev) =>
      clamp(prev, computed.dayTarget, Math.max(prev, computed.displayCount)),
    );
  }, [computed.displayCount, computed.dayTarget]);

  return {
    displayCount,
    dayTarget: computed.dayTarget,
    dayIncrease: computed.dayIncrease,
  };
}
