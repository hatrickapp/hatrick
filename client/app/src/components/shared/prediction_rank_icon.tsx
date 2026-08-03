import {
  HatrickHeroMedalIcon,
  RankChampionsCupIcon,
  RankCrownIcon,
  RankDiamondIcon,
  RankShieldIcon,
  RankStarIcon,
} from '@/components/shared/rank_medal_icon'
import type { UserProfileRank } from '@/types/user_types'

export function PredictionRankIcon({ rank, className = 'h-7 w-7' }: { rank: UserProfileRank; className?: string }) {
  if (rank.rank_key === 'bronze') return <RankShieldIcon className={className} color={rank.color_hex} tier="bronze" />
  if (rank.rank_key === 'silver') return <RankShieldIcon className={className} color={rank.color_hex} tier="silver" />
  if (rank.rank_key === 'gold') return <RankShieldIcon className={className} color={rank.color_hex} tier="gold" />
  if (rank.icon_key === 'diamond') return <RankDiamondIcon className={className} color={rank.color_hex} />
  if (rank.icon_key === 'star') return <RankStarIcon className={className} color={rank.color_hex} />
  if (rank.icon_key === 'football' || rank.icon_key === 'medal') return <HatrickHeroMedalIcon className={className} />
  if (rank.icon_key === 'crown') return <RankCrownIcon className={className} color={rank.color_hex} />
  if (rank.icon_key === 'champions') return <RankChampionsCupIcon className={className} color={rank.color_hex} />
  return <RankShieldIcon className={className} color={rank.color_hex} />
}
