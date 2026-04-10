import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 border font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Primary — lavender purple (#a28ef9)
        default:
          "bg-[#a28ef9] text-white border-transparent rounded-xl shadow-sm hover:bg-[#8f78f5] hover:shadow-md",
        // Dark pill — matches #222 active nav / filter pill
        dark:
          "bg-[#222222] text-white border-transparent rounded-full hover:bg-[#333]",
        // Outline — white bg, subtle border
        outline:
          "bg-white border-[#e5e7eb] text-[#374151] rounded-xl hover:bg-gray-50 hover:border-[#d1d5db]",
        // Secondary — mint green
        secondary:
          "bg-[#a4f5a6] text-[#166534] border-transparent rounded-xl hover:bg-[#86efac]",
        // Ghost — no bg, subtle hover
        ghost:
          "bg-transparent border-transparent text-[#374151] rounded-xl hover:bg-gray-100",
        // Destructive
        destructive:
          "bg-red-50 text-red-600 border-red-200 rounded-xl hover:bg-red-100",
        // Link
        link: "text-[#a28ef9] border-transparent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 text-sm",
        xs:      "h-6 px-2.5 text-xs rounded-lg",
        sm:      "h-8 px-3 text-sm",
        lg:      "h-10 px-5 text-sm",
        xl:      "h-11 px-6 text-base",
        icon:    "size-9 rounded-xl",
        "icon-sm": "size-8 rounded-xl",
        "icon-xs": "size-6 rounded-lg",
        "icon-lg": "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
