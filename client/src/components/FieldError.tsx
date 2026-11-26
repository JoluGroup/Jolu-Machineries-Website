import type { FieldName } from "@/lib/api"
import type { FieldErrors } from "@/hooks/use-submission"

/** Inline, screen-reader-announced field error. Renders nothing when the field is valid. */
const FieldError = ({ errors, name, idPrefix }: { errors: FieldErrors; name: FieldName; idPrefix: string }) => {
  const message = errors[name]
  if (!message) return null
  return (
    <p id={`${idPrefix}-${name}-error`} role="alert" className="mt-1 text-sm text-destructive">
      {message}
    </p>
  )
}

export default FieldError
