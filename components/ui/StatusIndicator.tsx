import * as React from "react"
import { cn } from "@/lib/utils"

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "idle" | "success" | "error"
}

export function StatusIndicator({
  status,
  className,
  ...props
}: StatusIndicatorProps) {
  return (
    <span
      className={cn("status-dot", status, className)}
      {...props}
    />
  )
}
