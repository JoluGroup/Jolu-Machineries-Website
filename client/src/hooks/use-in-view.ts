import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  /** Fire only the first time the element enters the viewport, then stop observing. */
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
};

/**
 * Zero-dependency scroll-visibility hook built on the native IntersectionObserver.
 * Returns a ref to attach to the target element and a boolean for whether it is in view.
 * Used for lightweight fade-up entrances and count-up triggers without any animation library.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  once = true,
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Graceful fallback for environments without IntersectionObserver.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return { ref, inView };
}
