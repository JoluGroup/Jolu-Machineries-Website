// M2-QUOTE-01: customer-facing wording for every SubmitOutcome. Pure and framework-free so it is unit-testable.
// Rules: never show raw server text or objects; never ask a customer to resend something that is already stored;
// distinguish "stored" from "staff notified"; contact details come only from the claims registry.
import { emails, phones, responseTime, visible } from "@/config/business"
import type { FieldName, SubmitOutcome } from "@/lib/api"

export interface Feedback {
  title: string
  description: string
  variant: "default" | "destructive"
  /** true when the request is stored on the server: the form can be cleared/closed. */
  stored: boolean
  /** Field-level messages to show inline (only for "invalid"). */
  fieldErrors: Partial<Record<FieldName, string>>
}

export const FIELD_MESSAGES: Record<FieldName, string> = {
  name: "Please enter your full name (at least 2 characters).",
  email: "Please enter a valid email address.",
  phone: "Please enter a valid phone number.",
  county: "Please choose your county.",
  area: "Please enter your area or town (at least 2 characters).",
  productInterest: "Please choose a product category.",
  message: "Please describe what you need (at least 10 characters).",
  preferredDate: "Please choose a preferred date.",
  preferredTime: "Please choose a preferred time.",
  product: "Please choose a product.",
  notes: "Please shorten your notes.",
}

export const FIELD_LABELS: Record<FieldName, string> = {
  name: "full name", email: "email", phone: "phone", county: "county", area: "area/town",
  productInterest: "product interest", message: "message", preferredDate: "preferred date",
  preferredTime: "preferred time", product: "product", notes: "notes",
}

function directContact(): string {
  const phone = visible(phones.primary)?.display
  const email = visible(emails.general)
  if (phone && email) return ` You can also call ${phone} or email ${email}.`
  if (phone) return ` You can also call ${phone}.`
  if (email) return ` You can also email ${email}.`
  return ""
}

export interface SuccessCopy { title: string; description?: string }

export function describeOutcome(outcome: SubmitOutcome, success: SuccessCopy): Feedback {
  const ok = (title: string, description: string): Feedback => ({ title, description, variant: "default", stored: true, fieldErrors: {} })
  const fail = (title: string, description: string, fieldErrors: Feedback["fieldErrors"] = {}): Feedback =>
    ({ title, description, variant: "destructive", stored: false, fieldErrors })

  switch (outcome.kind) {
    case "received":
      return ok(success.title, success.description ?? visible(responseTime) ?? "Our team will be in touch.")
    case "duplicate":
      return ok("Already received", "We already have this request, so there is no need to send it again.")
    case "saved_not_notified":
      // Stored successfully; only the internal staff email failed. Never ask the customer to resend.
      return ok("Request received", `Your request has been saved and our team will follow up.${directContact()}`)
    case "invalid": {
      const fields = outcome.fields.length ? outcome.fields : []
      const fieldErrors = Object.fromEntries(fields.map((f) => [f, FIELD_MESSAGES[f]])) as Feedback["fieldErrors"]
      const list = fields.map((f) => FIELD_LABELS[f]).join(", ")
      return fail("Please check the form", list ? `Some details need attention: ${list}.` : "Some details need attention. Please review the form and try again.", fieldErrors)
    }
    case "rate_limited":
      return fail("Too many attempts", "Please wait a minute, then try again.")
    case "in_progress":
      return fail("Already sending", "Your request is being processed. Please wait a moment before trying again.")
    case "unavailable":
      return fail("Service temporarily unavailable", `Your request was not sent. Please try again shortly.${directContact()}`)
    case "rejected":
      return fail("We couldn't send your request", `Please try again later.${directContact()}`)
    case "network":
      return fail("Connection problem", "We couldn't reach our server, so your request was not sent. Please check your connection and try again.")
    case "timeout":
      // The server may still have stored it; resending is safe because duplicates are detected server-side.
      return fail("No confirmation received", `We didn't get a confirmation in time. Your request may still have arrived; if you try again, we will not create a duplicate.${directContact()}`)
    case "misconfigured":
      return fail("Online requests are unavailable", `Please contact us directly.${directContact()}`)
    default:
      return fail("Something went wrong", `Your request may not have been sent. Please try again later.${directContact()}`)
  }
}

/** Client-side check for required Radix Select values, which the browser cannot enforce natively. */
export function missingSelections<T extends Partial<Record<FieldName, unknown>>>(form: T, required: FieldName[]): Feedback["fieldErrors"] {
  const out: Feedback["fieldErrors"] = {}
  for (const f of required) {
    const v = form[f]
    if (typeof v !== "string" || v.trim() === "") out[f] = FIELD_MESSAGES[f]
  }
  return out
}
