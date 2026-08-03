import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn('h-3 rounded-none bg-border/45', className)} />
}

function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-full bg-border/45', className)} />
}

function SkeletonSection({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('border-y border-border/40 py-6', className)}>{children}</div>
}

export function MatchesSkeleton() {
  return (
    <SkeletonSection className="min-h-[42vh]">
      <div className="space-y-8">
        {[0, 1].map((group) => (
          <div key={group} className="space-y-4">
            <div className="space-y-2 border-b border-border/30 pb-3">
              <SkeletonLine className="h-2.5 w-20" />
              <SkeletonLine className="h-4 w-36" />
            </div>
            {[0, 1, 2].map((row) => (
              <div key={row} className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-3 px-3 py-4">
                <div className="flex items-center justify-end gap-2">
                  <SkeletonLine className="h-4 w-20" />
                  <SkeletonCircle className="h-6 w-6" />
                </div>
                <SkeletonLine className="mx-auto h-4 w-12" />
                <div className="flex items-center gap-2">
                  <SkeletonCircle className="h-6 w-6" />
                  <SkeletonLine className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </SkeletonSection>
  )
}

export function PredictionsSkeleton() {
  return (
    <SkeletonSection className="min-h-[42vh]">
      <div className="divide-y divide-border/30">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="grid grid-cols-[minmax(0,1fr)_52px] gap-4 px-3 py-5">
            <div className="space-y-3">
              <SkeletonLine className="h-2.5 w-40" />
              <SkeletonLine className="h-4 w-48" />
              <SkeletonLine className="w-64 max-w-full" />
            </div>
            <div className="space-y-2">
              <SkeletonLine className="ml-auto h-5 w-8" />
              <SkeletonLine className="ml-auto h-2.5 w-12" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonSection>
  )
}

export function LeaguesSkeleton() {
  return (
    <SkeletonSection className="min-h-[42vh]">
      <div className="space-y-6">
        <div className="grid grid-cols-3 border border-border/40">
          {[0, 1, 2].map((item) => <SkeletonLine key={item} className="m-4 h-4" />)}
        </div>
        {[0, 1, 2].map((row) => (
          <div key={row} className="space-y-3 border-b border-border/30 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonLine className="h-5 w-40" />
                <SkeletonLine className="w-64 max-w-full" />
              </div>
              <SkeletonLine className="h-4 w-8" />
            </div>
            <div className="flex gap-3">
              <SkeletonCircle className="h-6 w-6" />
              <SkeletonCircle className="h-6 w-6" />
              <SkeletonCircle className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonSection>
  )
}

export function ProfileSkeleton() {
  return (
    <SkeletonSection className="min-h-[42vh] border-t-0 pt-0">
      <div className="space-y-8">
        <div className="flex items-center gap-5">
          <SkeletonCircle className="h-20 w-20" />
          <div className="space-y-3">
            <SkeletonLine className="h-5 w-44" />
            <SkeletonLine className="w-52" />
          </div>
        </div>
        <div className="space-y-5">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center justify-between gap-6 border-b border-border/30 pb-4">
              <SkeletonLine className="w-32" />
              <SkeletonLine className="h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonSection>
  )
}

export function PublicProfileSkeleton() {
  return (
    <SkeletonSection className="min-h-[50vh] border-t-0 pt-0">
      <div className="space-y-8">
        <div className="flex items-center gap-5">
          <SkeletonCircle className="h-24 w-24" />
          <div className="space-y-3">
            <SkeletonLine className="h-6 w-48" />
            <SkeletonLine className="w-36" />
            <SkeletonLine className="w-44" />
          </div>
        </div>
        <StatsGridSkeleton />
        <div className="grid gap-8">
          <div className="space-y-4">
            <SkeletonLine className="h-3 w-32" />
            <div className="grid grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((item) => <SkeletonLine key={item} className="h-32" />)}
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonLine className="h-3 w-32" />
            <SkeletonLine className="h-20" />
            <SkeletonLine className="h-24" />
          </div>
        </div>
      </div>
    </SkeletonSection>
  )
}

export function MatchDetailSkeleton() {
  return (
    <SkeletonSection className="min-h-[50vh]">
      <div className="space-y-10">
        <div className="space-y-4 text-center">
          <SkeletonLine className="mx-auto h-3 w-36" />
          <div className="grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-4">
            <div className="flex justify-end gap-3">
              <SkeletonLine className="h-5 w-24" />
              <SkeletonCircle className="h-9 w-9" />
            </div>
            <SkeletonLine className="mx-auto h-6 w-14" />
            <div className="flex gap-3">
              <SkeletonCircle className="h-9 w-9" />
              <SkeletonLine className="h-5 w-24" />
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <SkeletonLine className="h-3 w-20" />
          {[0, 1, 2].map((row) => <SkeletonLine key={row} className="h-11" />)}
        </div>
      </div>
    </SkeletonSection>
  )
}

export function SettingsListSkeleton() {
  return (
    <SkeletonSection className="min-h-[38vh]">
      <div className="space-y-5">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-4 border-b border-border/30 pb-4">
            <SkeletonCircle className="h-8 w-8" />
            <div className="space-y-2">
              <SkeletonLine className="h-4 w-40" />
              <SkeletonLine className="w-56" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonSection>
  )
}

export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="space-y-3 border-t border-border/30 pt-4">
          <SkeletonLine className="h-5 w-10" />
          <SkeletonLine className="h-2.5 w-20" />
        </div>
      ))}
    </div>
  )
}
