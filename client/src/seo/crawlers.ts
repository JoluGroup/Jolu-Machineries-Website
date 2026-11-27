// M2-AEO-GEO-01: crawler policy for robots.txt (owner-approved direction: allow search and answer-engine retrieval,
// disallow designated AI model-training crawlers). Identifiers checked against the vendors' current documentation:
//   - OpenAI: OAI-SearchBot (ChatGPT search results), GPTBot (training), ChatGPT-User (user-initiated fetches; OpenAI
//     states robots.txt rules may not apply to it).
//   - Anthropic: ClaudeBot (training), Claude-SearchBot (search quality), Claude-User (user-initiated fetches).
//   - Perplexity: PerplexityBot (search indexing). Perplexity-User (user-initiated) generally ignores robots.txt and is
//     therefore not listed.
//   - Google: Googlebot (Search, incl. AI Overviews). Google-Extended is a control TOKEN, not a crawler: it governs use
//     for Gemini model training AND grounding in Gemini apps / Vertex AI. It does not affect Google Search ranking.
//   - Bing: Bingbot.
// robots.txt is advisory: it does not technically prevent collection and does not bind every fetcher.
// Twitterbot and facebookexternalhit are kept from the previous robots.txt so link previews keep working.

export interface CrawlerRule { readonly agent: string; readonly allow: boolean; readonly purpose: string }

export const CRAWLER_POLICY: readonly CrawlerRule[] = [
  { agent: "Googlebot", allow: true, purpose: "Google Search indexing" },
  { agent: "Bingbot", allow: true, purpose: "Bing search indexing (also used by Microsoft Copilot search)" },
  { agent: "OAI-SearchBot", allow: true, purpose: "ChatGPT search results" },
  { agent: "ChatGPT-User", allow: true, purpose: "User-initiated fetches in ChatGPT" },
  { agent: "PerplexityBot", allow: true, purpose: "Perplexity search indexing" },
  { agent: "Claude-SearchBot", allow: true, purpose: "Claude search results" },
  { agent: "Claude-User", allow: true, purpose: "User-initiated fetches in Claude" },
  { agent: "Twitterbot", allow: true, purpose: "Link previews" },
  { agent: "facebookexternalhit", allow: true, purpose: "Link previews" },
  { agent: "GPTBot", allow: false, purpose: "OpenAI model training" },
  { agent: "Google-Extended", allow: false, purpose: "Gemini training and grounding (control token)" },
  { agent: "ClaudeBot", allow: false, purpose: "Anthropic model training" },
]

export function buildRobotsTxt(indexable: boolean, sitemapUrl: string): string {
  if (!indexable) {
    return "# Non-production build: not for indexing.\nUser-agent: *\nDisallow: /\n"
  }
  const blocks = CRAWLER_POLICY.map((r) => `# ${r.purpose}\nUser-agent: ${r.agent}\n${r.allow ? "Allow: /" : "Disallow: /"}\n`)
  return [...blocks, "User-agent: *\nAllow: /\n", `Sitemap: ${sitemapUrl}\n`].join("\n")
}
