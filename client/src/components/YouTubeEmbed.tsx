import { useState } from "react"
import { Play } from "lucide-react"

// Click-to-load YouTube player. Before interaction it renders a local placeholder only: no iframe and no request
// to any third-party host (not even a thumbnail). After interaction it loads the privacy-enhanced
// youtube-nocookie.com player.

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/
export const youtubeNoCookieUrl = (videoId: string, autoplay = false) => {
  if (!YOUTUBE_ID.test(videoId)) throw new Error(`invalid YouTube id: ${videoId}`)
  return `https://www.youtube-nocookie.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}`
}

type Props = { videoId: string; title: string; className?: string }

const YouTubeEmbed = ({ videoId, title, className = "" }: Props) => {
  const [loaded, setLoaded] = useState(false)
  if (loaded) {
    return (
      <iframe
        className={className}
        src={youtubeNoCookieUrl(videoId, true)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    )
  }
  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      aria-label={`Play video: ${title} (loads YouTube)`}
      className={`${className} group flex flex-col items-center justify-center gap-3 bg-gradient-hero text-white`}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 transition-colors group-hover:bg-white/25">
        <Play className="h-8 w-8" aria-hidden="true" />
      </span>
      <span className="px-6 text-center text-base font-semibold">{title}</span>
      <span className="px-6 text-center text-xs text-white/70">Plays from YouTube (privacy-enhanced mode) when you click.</span>
    </button>
  )
}

export default YouTubeEmbed
