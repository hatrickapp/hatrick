import {
  BronzeRankShieldIcon,
  GoldRankShieldIcon,
  HatrickHeroMedalIcon,
  RankChampionsCupIcon,
  RankCrownIcon,
  RankDiamondIcon,
  RankStarIcon,
  SilverRankShieldIcon,
} from '@/components/shared/rank_medal_icon'

export const competitions = [
  { name: 'Champions League', logo: 'https://media.api-sports.io/football/leagues/2.png' },
  { name: 'Europa League', logo: 'https://media.api-sports.io/football/leagues/3.png' },
  { name: 'Conference League', logo: 'https://media.api-sports.io/football/leagues/848.png' },
  { name: 'Premier League', logo: 'https://media.api-sports.io/football/leagues/39.png' },
  { name: 'La Liga', logo: 'https://media.api-sports.io/football/leagues/140.png' },
  { name: 'Serie A', logo: 'https://media.api-sports.io/football/leagues/135.png' },
  { name: 'Bundesliga', logo: 'https://media.api-sports.io/football/leagues/78.png' },
  { name: 'MLS', logo: 'https://media.api-sports.io/football/leagues/253.png' },
]

export const predictionRules = [
  { label: 'Winner / Draw', example: 'Argentina', points: 10 },
  { label: 'Both Teams To Score', example: 'Yes', points: 10 },
  { label: 'Anytime Scorer', example: 'Lionel Messi', points: 25 },
  { label: 'Hatrick Bonus', example: 'All three correct', points: 15 },
]

export const ranks = [
  { name: 'Bronze', points: 0, color: '#C47A3D', icon: BronzeRankShieldIcon },
  { name: 'Silver', points: 150, color: '#9CA3AF', icon: SilverRankShieldIcon },
  { name: 'Gold', points: 350, color: '#D6A400', icon: GoldRankShieldIcon },
  { name: 'Platinum', points: 700, color: '#2D9CDB', icon: RankDiamondIcon },
  { name: 'All Star', points: 1200, color: '#E7B416', icon: RankStarIcon },
  { name: 'Hatrick Hero', points: 2000, color: '#C62828', icon: HatrickHeroMedalIcon },
  { name: 'Legend', points: 3500, color: '#C69214', icon: RankCrownIcon },
  { name: 'Hall of Fame', points: 5000, color: '#5B3FD6', icon: RankChampionsCupIcon },
]
