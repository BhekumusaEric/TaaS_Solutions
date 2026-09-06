import * as React from "react"
import { cn } from "@/lib/utils"

const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) {
    return null
  }

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-red-500 mt-1.5", className)}
      role="alert"
      {...props}
    >
      {children}
    </p>
  )
})
FormError.displayName = "FormError"

export { FormError }
