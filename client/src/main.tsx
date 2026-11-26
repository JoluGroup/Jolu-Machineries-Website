import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { preloadRoute } from './routeTable'
import './index.css'

// The page HTML is prerendered at build time (M2-SEO-01). Load the current route's code first so the first client
// render replaces the prerendered markup with the same page instead of a "Loading..." fallback. createRoot (not
// hydrateRoot) is used deliberately: it tolerates differences between build-time and browser output (carousel state,
// animations), which hydration would treat as errors.
const mount = () => createRoot(document.getElementById("root")!).render(<App />);
preloadRoute(window.location.pathname).then(mount, mount);
