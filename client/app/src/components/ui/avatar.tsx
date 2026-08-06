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

  const avatar = React.isValidElement<{ className?: string }>(children)
    ? React.cloneElement(children, {
        className: cn(children.props.className, "border-0 shadow-none"),
      })
    : children

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 rounded-full leading-none p-[2px] bg-[conic-gradient(from_215deg,#FFF3A0_0deg,#FFEA76_36deg,#FFE05A_72deg,#F7D343_108deg,#EBC536_144deg,#DDB82D_180deg,#D4AF37_216deg,#C69D22_252deg,#D4AF37_288deg,#E8C742_324deg,#FFF3A0_360deg)]",
        className
      )}
    >
      <span className="relative flex overflow-hidden rounded-full bg-background">
        {avatar}
      </span>
    </span>
  )
}

export { Avatar, AvatarFallback, AvatarPlaceholder, PlusAvatarRing }
