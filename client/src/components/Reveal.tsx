import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Optional stagger delay in ms. */
  delay?: number;
};

/**
 * Lightweight scroll-entrance wrapper: fades and slides its children up
 * (opacity 0, y 15px -> opacity 1, y 0) the first time they enter the viewport.
 * Uses only CSS transitions + a native IntersectionObserver, so it adds no bundle bloat.
 * Only opacity/transform change, so it introduces zero cumulative layout shift.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true });

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[15px]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Reveal;
