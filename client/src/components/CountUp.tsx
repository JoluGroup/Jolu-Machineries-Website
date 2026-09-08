import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  target: number;
  /** Animation begins when this flips to true (driven by an IntersectionObserver). */
  start: boolean;
  durationMs?: number;
  suffix?: string;
};

/**
 * Counts up from 0 to `target` over ~1s using requestAnimationFrame with an ease-out curve.
 * A persistent `hasAnimated` ref lock guarantees the animation fires strictly ONCE, so
 * mobile layout shifts / re-renders can never restart or replay it.
 */
export function CountUp({ target, start, durationMs = 1000, suffix = "" }: CountUpProps) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!start || hasAnimated.current) return;
    hasAnimated.current = true;

    let raf = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, durationMs]);

  return (
    <>
      {value}
      {suffix}
    </>
  );
}

export default CountUp;
