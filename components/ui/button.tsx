import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "btn-pill cursor-pointer",
  {
    variants: {
      variant: {
        default: "",
        outline: "!border-[rgba(255,255,255,0.2)]",
        ghost: "!border-transparent hover:!border-[rgba(255,255,255,0.2)]",
        solana: "",
        solanaOutline: "",
      },
      size: {
        default: "",
        sm: "!py-[0.4rem] !px-[1.2rem] !text-[0.75rem]",
        lg: "!py-[1rem] !px-[2.5rem]",
        xl: "!py-[1.2rem] !px-[3rem] !text-[1rem]",
        icon: "!p-[0.6rem] !rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
