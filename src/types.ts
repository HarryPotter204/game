export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover';

export type ControlScheme = 'follow' | 'keys_buttons' | 'split_touch';

export interface Character {
  id: 'harry' | 'hermione' | 'ron';
  name: string;
  badge: string;
  perkDescription: string;
  speed: number;
  maxLives: number;
  perk: 'near_miss_bonus' | 'shield_magnet' | 'extra_life_luck';
  hairColor: string;
  robeColor: string;
  accentColor: string;
  hasGlasses?: boolean;
}

export interface CurseSpell {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  length: number;
  angle: number;
  speed: number;
  trail: { x: number; y: number; alpha: number }[];
  hue: number; // typically 135-155 (emerald green)
  power: number;
}

export interface CollectibleGem {
  id: number;
  x: number;
  y: number;
  vy: number;
  size: number;
  type: 'galleon' | 'emerald' | 'ruby' | 'shield' | 'star';
  value: number;
  sparkleTimer: number;
  rotation: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface DustCloud {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  fontSize: number;
}

export interface Torch {
  x: number;
  y: number;
  intensity: number;
  flickerSpeed: number;
  flickerOffset: number;
}

export interface Duelist {
  x: number;
  y: number;
  direction: 'left' | 'right';
  wandCastTimer: number;
  wandSparkTimer: number;
  sparkColor: string;
}

export interface MagicMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  alpha: number;
  baseAlpha: number;
  flickerSpeed: number;
  flickerOffset: number;
  driftPhase: number;
  driftSpeed: number;
}

export interface RankingEntry {
  id?: string;
  playerName: string;
  characterId: string;
  characterName: string;
  score: number;
  galleons: number;
  level: number;
  createdAt: string;
}

export type RankingTab = 'score' | 'galleons';

