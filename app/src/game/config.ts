// Конфиг экономики и каталог штампов — из content/*.json (одна точка правки).
import shop from '../../../content/shop.json';
import stickers from '../../../content/stickers.json';

export type ItemEffect =
  | { type: 'boost'; minutes: number; xpMult: number }
  | { type: 'shield'; max: number }
  | { type: 'energy'; amount: number };
export interface ShopItem { id: string; name: string; emoji: string; desc: string; price: number; effect: ItemEffect; freeOnly?: boolean }
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export interface Sticker {
  id: string; name: string; emoji: string; rarity: Rarity; album: string;
  cond: { type: string; n: number }; premium?: boolean; hidden?: boolean;
}

export const ENERGY = shop.energy;
export const REWARDS = shop.rewards;
export const ITEMS = shop.items as ShopItem[];
export const ALBUMS = stickers.albums as { id: string; name: string; premium?: boolean }[];
export const STICKERS = stickers.stickers as Sticker[];
export const REVIEW_MAX_WORDS = 12;
