import type { SVGProps } from 'react'

type RankIconProps = SVGProps<SVGSVGElement> & {
  color?: string
}

function svgColor(color?: string) {
  return color ?? 'currentColor'
}

export function HatrickHeroMedalIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" {...props}>
      <path d="M9.5 3.5H15L13.15 13H7.65L9.5 3.5Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M17 3.5H22.5L24.35 13H18.85L17 3.5Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M13.15 13H18.85L16 16.8L13.15 13Z" fill="#8B1A1A" stroke="#7F1D1D" strokeWidth="1.1" strokeLinejoin="round" />
      <circle cx="16" cy="21" r="8" fill="#F4C430" stroke="#B7791F" strokeWidth="1.5" />
      <circle cx="16" cy="21" r="5.2" fill="#FFD766" stroke="#D69E2E" strokeWidth="1" />
      <path
        d="M16 16.95L17.05 19.1L19.42 19.44L17.71 21.11L18.11 23.47L16 22.35L13.89 23.47L14.29 21.11L12.58 19.44L14.95 19.1L16 16.95Z"
        fill="#B91C1C"
      />
    </svg>
  )
}

export function RankShieldIcon({
  className,
  color,
  tier = 'bronze',
  ...props
}: RankIconProps & { tier?: 'bronze' | 'silver' | 'gold' }) {
  const fill = svgColor(color)
  const accent = tier === 'gold' ? '#F7D56B' : tier === 'silver' ? '#E7E2D9' : '#E7A46F'
  const dark = tier === 'gold' ? '#8A5A00' : tier === 'silver' ? '#5F646B' : '#7B3F26'

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" {...props}>
      <path d="M16 3.2L26 7.1V14.9C26 21.15 21.8 26.65 16 28.85C10.2 26.65 6 21.15 6 14.9V7.1L16 3.2Z" fill={fill} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M16 5.9L23.45 8.8V14.75C23.45 19.55 20.4 23.85 16 25.8C11.6 23.85 8.55 19.55 8.55 14.75V8.8L16 5.9Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M10.3 9.7L16 7.5L21.7 9.7" stroke={accent} strokeWidth={tier === 'bronze' ? 1.1 : 1.35} strokeLinecap="round" />
      {tier !== 'bronze' && (
        <path d="M9.8 18.4C12.1 20.25 13.9 21.25 16 22.15C18.1 21.25 19.9 20.25 22.2 18.4" stroke={accent} strokeWidth="1.1" strokeLinecap="round" />
      )}
      {tier === 'gold' && (
        <>
          <path d="M8.35 12.2L6.6 10.8M23.65 12.2L25.4 10.8" stroke={accent} strokeWidth="1.15" strokeLinecap="round" />
          <circle cx="16" cy="16" r="5.4" fill="rgba(255,255,255,0.16)" stroke={accent} strokeWidth="1" />
        </>
      )}
      <path d="M13.15 13.45C14.7 12.05 17.3 12.05 18.85 13.45C20.32 14.8 20.32 17.2 18.85 18.55C17.3 19.95 14.7 19.95 13.15 18.55C11.68 17.2 11.68 14.8 13.15 13.45Z" fill="#F8F5EF" stroke={dark} strokeWidth="0.8" />
      <path d="M16 12.7L17.55 14.1L16.95 16H15.05L14.45 14.1L16 12.7Z" fill={dark} />
      <path d="M12.9 16.1L15.05 16M16.95 16L19.1 16.1M14 18.25L15.05 16M18 18.25L16.95 16" stroke={dark} strokeWidth="0.65" strokeLinecap="round" />
    </svg>
  )
}

export function RankDiamondIcon({ className, color, ...props }: RankIconProps) {
  const fill = svgColor(color)
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" {...props}>
      <path d="M8.2 7.5H23.8L28 13.2L16 28L4 13.2L8.2 7.5Z" fill={fill} stroke="#0F4C5C" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8.2 7.5L12.2 13.2L16 7.5L19.8 13.2L23.8 7.5M4 13.2H28M12.2 13.2L16 28L19.8 13.2" stroke="rgba(255,255,255,0.65)" strokeWidth="1" strokeLinejoin="round" />
      <path d="M10.3 9.6H21.7" stroke="#D7F7FF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function RankStarIcon({ className, color, ...props }: RankIconProps) {
  const fill = svgColor(color)
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" {...props}>
      <path d="M16 3.6L19.45 11.05L27.55 12.05L21.55 17.6L23.1 25.65L16 21.65L8.9 25.65L10.45 17.6L4.45 12.05L12.55 11.05L16 3.6Z" fill={fill} stroke="#7C520A" strokeWidth="1.45" strokeLinejoin="round" />
      <path d="M16 7.8L18.1 12.35L23.05 12.95L19.4 16.35L20.35 21.25L16 18.8L11.65 21.25L12.6 16.35L8.95 12.95L13.9 12.35L16 7.8Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.9" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3.1" fill="#FFF4BF" stroke="#9A6408" strokeWidth="0.8" />
    </svg>
  )
}

export function RankCrownIcon({ className, color, ...props }: RankIconProps) {
  const fill = svgColor(color)
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" {...props}>
      <path d="M5.5 11.6L11.1 16.1L16 7.4L20.9 16.1L26.5 11.6L24.7 24.5H7.3L5.5 11.6Z" fill={fill} stroke="#6E4A07" strokeWidth="1.45" strokeLinejoin="round" />
      <path d="M8.1 22.1H23.9" stroke="#F8D870" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M11.1 16.1L12.2 21.15M16 7.4V21.15M20.9 16.1L19.8 21.15" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round" />
      <circle cx="16" cy="7.4" r="1.7" fill="#FFF1A8" stroke="#6E4A07" strokeWidth="0.8" />
      <circle cx="5.5" cy="11.6" r="1.35" fill="#FFF1A8" stroke="#6E4A07" strokeWidth="0.75" />
      <circle cx="26.5" cy="11.6" r="1.35" fill="#FFF1A8" stroke="#6E4A07" strokeWidth="0.75" />
    </svg>
  )
}

export function RankChampionsCupIcon({ className, color, ...props }: RankIconProps) {
  const fill = svgColor(color)
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="none" {...props}>
      <path d="M10 6.2H22V13.9C22 18.05 19.45 20.8 16 20.8C12.55 20.8 10 18.05 10 13.9V6.2Z" fill={fill} stroke="#361D52" strokeWidth="1.45" strokeLinejoin="round" />
      <path d="M10 9H6.2V11.8C6.2 15.05 8.25 17.15 11.35 17.4M22 9H25.8V11.8C25.8 15.05 23.75 17.15 20.65 17.4" stroke="#361D52" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M16 20.8V24.3M11.8 26.3H20.2M13 24.3H19" stroke="#361D52" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.6 8.8H19.4M12.75 11.4H19.25" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" />
      <path d="M16 12.1L16.85 13.8L18.75 14.08L17.38 15.4L17.7 17.28L16 16.4L14.3 17.28L14.62 15.4L13.25 14.08L15.15 13.8L16 12.1Z" fill="#F6E8FF" />
    </svg>
  )
}
