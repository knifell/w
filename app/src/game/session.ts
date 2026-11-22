// Запись результата занятия: память слов, награды, костёр, штампы, открытие островов.
import { nowMs } from './clock';
import type { LevelPack } from '../types';
import { update, type LocalState } from './local';
import { REWARDS, type Sticker } from './config';
import { applyAnswer } from './srs';
import { bumpStreak, settleStreak, RESCUE_SESSIONS } from './streak';
import { activeMult } from './shop';
import { awardStickers } from './stickers';
import { commitUnlocks } from './progress';
import { settleEnergy } from './energy';
import { today } from './time';

export type SessionKind = 'lesson' | 'review' | 'trial';
export interface SessionResult { kind: SessionKind; lessonId?: string; accuracy: number; seen: string[]; wrong: string[] }
export interface Reward {
  xp: number; coins: number; mult: number; perfect: boolean; grown: number;
  streak: number; streakUp: boolean; rescueLeft: number; stickers: Sticker[]; capped: boolean;
}

/** Ежедневная «уборка» при запуске. */
export function settleAll(packs: LevelPack[]): [LocalState, Sticker[]] {
  return update((s) => {
    settleEnergy(s);
    settleStreak(s, today());
    commitUnlocks(s, packs);
    return awardStickers(s);
  });
}

export function recordSession(res: SessionResult, packs: LevelPack[]): Reward {
  return update((s) => {
    const day = today();
    settleStreak(s, day);
    const wrong = new Set(res.wrong);
    let grown = 0;
    if (res.kind !== 'trial') for (const id of res.seen) {
      const [m, up] = applyAnswer(s.mem[id], !wrong.has(id), day, s.premium);
      s.mem[id] = m;
      if (up) grown++;
    }
    const perfect = wrong.size === 0;
    let base = REWARDS[res.kind];
    let capped = false;
    if (res.kind === 'trial') {
      if (s.trialsToday.day !== day) s.trialsToday = { day, n: 0 };
      capped = ++s.trialsToday.n > REWARDS.trialDailyRewarded;
      if (capped) base = { xp: 0, coins: 0 };
    }
    const mult = activeMult(s);
    const xp = (base.xp + (res.kind === 'lesson' && perfect ? REWARDS.perfect.xp : 0)) * mult;
    const coins = (base.coins + (res.kind === 'lesson' && perfect ? REWARDS.perfect.coins : 0)) * (s.premium ? REWARDS.premiumCoinMult : 1);
    s.xp += xp;
    s.coins += coins;
    const c = s.counters;
    const inc = (k: string) => { c[k] = (c[k] ?? 0) + 1; };
    inc(res.kind === 'lesson' ? 'lessons' : res.kind === 'review' ? 'reviews' : 'trials');
    if (res.kind === 'lesson' && perfect) inc('perfect');
    const h = new Date(nowMs()).getHours();
    if (h < 5) inc('night'); else if (h < 8) inc('early');
    if (res.lessonId) s.done[res.lessonId] = { best: Math.max(res.accuracy, s.done[res.lessonId]?.best ?? 0), at: nowMs() };
    const streakUp = bumpStreak(s, day);
    commitUnlocks(s, packs);
    const stickers = awardStickers(s);
    const rescueLeft = s.rescue?.day === day ? RESCUE_SESSIONS - s.rescue.count : 0;
    return { xp, coins, mult, perfect, grown, streak: s.streak.cur, streakUp, rescueLeft, stickers, capped };
  })[1];
}
