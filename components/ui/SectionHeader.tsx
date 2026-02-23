import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
}

export function SectionHeader({
  title,
  subtitle,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("", className)} {...props}>
      <h2 className="page-title">{title}</h2>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  )
}
