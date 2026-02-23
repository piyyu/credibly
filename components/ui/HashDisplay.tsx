"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HashDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  hash: string
  truncate?: boolean
  label?: string
}

export function HashDisplay({
  hash,
  truncate = false,
  label,
  className,
  ...props
}: HashDisplayProps) {
  const [copied, setCopied] = React.useState(false)

  const displayHash =
    truncate && hash.length > 20
      ? `${hash.slice(0, 8)}...${hash.slice(-8)}`
      : hash

  const handleCopy = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("hash-block", className)} {...props}>
      {label && <span className="hash-label">{label}</span>}
      <div className="hash-value-row">
        <div className="hash-value" style={{ flex: 1 }}>{displayHash}</div>
        <button
          className="hash-copy-btn"
          onClick={handleCopy}
          title="Copy to clipboard"
          type="button"
        >
          {copied ? "✓" : "⧉"}
        </button>
      </div>
    </div>
  )
}
