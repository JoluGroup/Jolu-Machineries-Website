import { forwardRef, type ImgHTMLAttributes } from "react"
import manifest from "@/generated/image-manifest.json"
import { resolveImage, type ImageManifest } from "@/lib/image-utils"

interface ResponsiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "sizes"> {
  /** The same path or asset key the page previously passed to <img src>. */
  src: string
  /** Rendered width hint, e.g. "(min-width: 1024px) 25vw, 50vw". Defaults to full width. */
  sizes?: string
  /** Above-the-fold image: loads immediately with high fetch priority. */
  priority?: boolean
  /** Explicit fetch priority hint; overrides the one implied by `priority`. */
  fetchPriority?: "high" | "low" | "auto"
}

/**
 * <img> with generated WebP variants (srcset + sizes), intrinsic width/height
 * (reserves layout space) and lazy loading by default. If an image has no
 * generated variants it renders exactly as before.
 */
const ResponsiveImage = forwardRef<HTMLImageElement, ResponsiveImageProps>(function ResponsiveImage(
  { src, sizes = "100vw", priority = false, fetchPriority, alt, loading, decoding, ...rest },
  ref,
) {
  const resolved = resolveImage(manifest as ImageManifest, src, import.meta.env.BASE_URL)
  if (!resolved && import.meta.env.DEV) {
    console.warn(`[ResponsiveImage] no generated variants for "${src}", using the original file`)
  }
  const priorityHint = fetchPriority ?? (priority ? "high" : undefined)
  // React 18 only forwards the lowercase attribute name.
  const hint = priorityHint ? ({ fetchpriority: priorityHint } as Record<string, string>) : {}
  return (
    <img
      ref={ref}
      {...rest}
      {...hint}
      src={resolved ? resolved.src : src}
      srcSet={resolved?.srcSet}
      sizes={resolved ? sizes : undefined}
      width={resolved?.width}
      height={resolved?.height}
      alt={alt}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? "async"}
    />
  )
})

export default ResponsiveImage
