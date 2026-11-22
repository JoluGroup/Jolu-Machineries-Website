import type { ReactNode } from "react"

interface A4PageProps {
  tone: "dark" | "light"
  label: string
  index: string
  children: ReactNode
}

/** One fixed 210 x 297 mm sheet with CAD-style registration marks. */
const A4Page = ({ tone, label, index, children }: A4PageProps) => (
  <div className="ss-stage">
    <section className={`ss-page ss-${tone}`} aria-label={label}>
      <span className="ss-cross tl" aria-hidden="true">+</span>
      <span className="ss-cross tr" aria-hidden="true">+</span>
      <span className="ss-cross bl" aria-hidden="true">+</span>
      <span className="ss-cross br" aria-hidden="true">+</span>
      <div className="ss-inner">{children}</div>
      <div className="ss-index" aria-hidden="true">{index}</div>
    </section>
  </div>
)

export default A4Page
