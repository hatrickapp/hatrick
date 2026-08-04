"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

function AvatarPlaceholder({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-full w-full overflow-hidden rounded-full bg-[#d9dce1]",
        className
      )}
    >
      <span className="absolute left-1/2 top-[23%] h-[28%] w-[28%] -translate-x-1/2 rounded-full bg-background" />
      <span className="absolute bottom-[-15%] left-1/2 h-[52%] w-[70%] -translate-x-1/2 rounded-[50%] bg-background" />
    </span>
  )
}

function PlusAvatarRing({
  children,
  className,
  active,
}: {
  children: React.ReactNode
  className?: string
  active?: boolean
}) {
  if (!active) return <>{children}</>

  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full bg-[conic-gradient(from_215deg,#FFF7C2_0deg,#FFE66D_42deg,#F8D84F_88deg,#E8C03B_132deg,#D4AF37_178deg,#B89320_226deg,#D4AF37_274deg,#FFE66D_318deg,#FFF7C2_360deg)] p-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_0_14px_rgba(212,175,55,0.26)]",
        className
      )}
    >
      <span className="rounded-full bg-background p-[2px]">
        {children}
      </span>
    </span>
  )
}

export { Avatar, AvatarFallback, AvatarPlaceholder, PlusAvatarRing }
