import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    // Skip the initial mount: the prerendered page is already shown and the visitor may have started scrolling.
    if (first.current) {
      first.current = false;
      if (!hash) return;
    }
    if (hash) {
      // getElementById never throws on unusual fragments (e.g. "#1abc"), unlike querySelector.
      let id = hash.slice(1);
      try { id = decodeURIComponent(id); } catch { /* keep raw */ }
      const element = document.getElementById(id);
      if (element) {
        // Delay ensures the element is in the DOM
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
