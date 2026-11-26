// M2-QUOTE-01: shared submit state for the enquiry forms (quote page, quote drawer, contact section, schedule visit).
// - A ref guard blocks a second submit before React re-renders (double click / double Enter).
// - Outcome wording comes from describeOutcome(); field errors are shown inline and announced.
import { useCallback, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { FieldName, SubmitOutcome } from "@/lib/api"
import { describeOutcome, type Feedback, type SuccessCopy } from "@/lib/submit-feedback"

export type FieldErrors = Feedback["fieldErrors"]

export function useSubmission() {
  const { toast } = useToast()
  const inFlight = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const clearFieldError = useCallback((name: string) => {
    setFieldErrors((e) => {
      if (!(name in e)) return e
      const next = { ...e }
      delete next[name as FieldName]
      return next
    })
  }, [])

  const submit = useCallback(
    async (opts: {
      run: () => Promise<SubmitOutcome>
      success: SuccessCopy
      onStored: () => void
      precheck?: () => FieldErrors
    }): Promise<Feedback | null> => {
      if (inFlight.current) return null
      const pre = opts.precheck ? opts.precheck() : {}
      if (Object.keys(pre).length) {
        setFieldErrors(pre)
        const feedback = describeOutcome({ kind: "invalid", fields: Object.keys(pre) as FieldName[] }, opts.success)
        toast({ title: feedback.title, description: feedback.description, variant: feedback.variant })
        return feedback
      }
      inFlight.current = true
      setIsSubmitting(true)
      try {
        const feedback = describeOutcome(await opts.run(), opts.success)
        setFieldErrors(feedback.fieldErrors)
        toast({ title: feedback.title, description: feedback.description, variant: feedback.variant })
        if (feedback.stored) opts.onStored()
        return feedback
      } finally {
        inFlight.current = false
        setIsSubmitting(false)
      }
    },
    [toast],
  )

  return { isSubmitting, fieldErrors, setFieldErrors, clearFieldError, submit }
}

/** Props for an input/select trigger so assistive technology links it to its inline error. */
export function errorProps(fieldErrors: FieldErrors, name: FieldName, idPrefix: string) {
  const has = Boolean(fieldErrors[name])
  return has ? { "aria-invalid": true as const, "aria-describedby": `${idPrefix}-${name}-error` } : { "aria-invalid": false as const }
}
