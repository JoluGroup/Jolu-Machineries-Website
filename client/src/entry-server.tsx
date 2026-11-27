// M2-SEO-01: build-time renderer (bundled by scripts/prerender.mjs with esbuild, run in Node). Not part of the client
// bundle. Renders a route with StaticRouter inside the same providers and route table as the browser app.
import { renderToStaticMarkup } from "react-dom/server";
import { StaticRouter } from "react-router-dom"; // v7: StaticRouter is a main export (no "/server" subpath)
import { AppProviders, AppRoutes } from "./App";
import { ROUTE_TABLE, preloadAllRoutes } from "./routeTable";

export { allRoutes, NOT_FOUND_ROUTE, routeForPath } from "./seo/routes";
export { buildHead, renderHeadHtml } from "./seo/head";
export { buildRobotsTxt, CRAWLER_POLICY } from "./seo/crawlers";
export { canonicalUrl, SITE_ORIGIN } from "./seo/site";
export { ALLOWED_TYPES } from "./seo/structured-data";

export const ROUTE_PATTERNS = ROUTE_TABLE.map((r) => r.path);

let ready: Promise<unknown> | null = null;

export async function renderRoute(url: string): Promise<string> {
  ready ??= preloadAllRoutes();
  await ready;
  return renderToStaticMarkup(
    <AppProviders>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </AppProviders>,
  );
}
