import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold" +
  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" +
  " disabled:pointer-events-none disabled:opacity-40" +
  " [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " transition-all duration-250 ease-in-out active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary/80 shadow-sm" +
          " hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive/80" +
          " hover:scale-[1.02] hover:shadow-[0_0_16px_rgba(239,68,68,0.35)]",
        outline:
          "border border-white/12 bg-white/4 text-foreground backdrop-blur-sm" +
          " hover:bg-white/8 hover:border-white/20 hover:scale-[1.01]",
        secondary:
          "bg-secondary text-secondary-foreground border border-white/8" +
          " hover:bg-white/8 hover:scale-[1.01]",
        ghost:
          "border border-transparent text-foreground" +
          " hover:bg-white/6 hover:border-white/8",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-lg px-3 text-xs",
        lg: "min-h-11 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
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
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
