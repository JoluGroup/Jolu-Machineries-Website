import type { SpecSheet } from "@/data/spec-sheets/types"
import QuoteDrawer from "@/components/QuoteDrawer"

/** Procurement footer: existing website contact details and the existing quote drawer (no new endpoint). */
const ProcurementBlock = ({ sheet }: { sheet: SpecSheet }) => (
  <>
    <footer className="ss-procurement">
      <div className="ss-contact">
        <strong>Sales enquiries / JOLU Machineries</strong>
        <span>Phone: {sheet.contact.phones.join(" | ")}</span>
        <span>Email: {sheet.contact.email}</span>
        {sheet.contact.offices.map((o) => (
          <span key={o}>{o}</span>
        ))}
      </div>
      <QuoteDrawer
        product={{ name: sheet.productName, hp: "130–160 hp" }}
        trigger={<button type="button" className="ss-cta">Request a quote →</button>}
      />
    </footer>
    <div className="ss-fineprint">{sheet.confirmNote}</div>
  </>
)

export default ProcurementBlock
