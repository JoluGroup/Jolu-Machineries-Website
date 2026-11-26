import { useState } from "react"
import { ExternalLink, MapPin } from "lucide-react"

// Click-to-load Google Maps. Before interaction: the location label, a "Show map" button and a plain
// "Open in Google Maps" link (a link makes no request until the visitor follows it). No google.com iframe is
// rendered until the visitor asks for the map.

type Props = { title: string; label: string; embedSrc: string; query: string; height?: number }

export const mapsSearchUrl = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

const MapEmbed = ({ title, label, embedSrc, query, height = 250 }: Props) => {
  const [loaded, setLoaded] = useState(false)
  if (loaded) {
    return (
      <iframe
        title={title}
        src={embedSrc}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
      />
    )
  }
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-muted/40 px-4 text-center"
      style={{ height }}
    >
      <MapPin className="h-7 w-7 text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`Show map: ${title} (loads Google Maps)`}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Show map
        </button>
        <a
          href={mapsSearchUrl(query)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open in Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
      <p className="text-xs text-muted-foreground">The map loads from Google only when you choose to show it.</p>
    </div>
  )
}

export default MapEmbed
