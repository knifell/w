// Быстрые проверки игровой логики без браузера: npm test
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, cpSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyAnswer } from '../app/src/engine/../game/srs';
import { emptyState } from '../app/src/game/local';
import { settleStreak, bumpStreak, liveStreak } from '../app/src/game/streak';
import { commitUnlocks, islandState, unlockGap, nextSteps } from '../app/src/game/progress';
import { refundEnergy, spendEnergy } from '../app/src/game/energy';
import { nowMs, resetClock, setTrustedStart } from '../app/src/game/clock';
import { applyStatus, applyFriendGift } from '../app/src/game/purchases';
import { STAR_PACKS, REFERRAL } from '../app/src/game/config';
import { signInitData, verifyInitData } from '../worker/src/auth';
import worker, { catalogItem, handleUpdate, handleStatus, handleReferral, type Env } from '../worker/src/index';
import { pack as packState, unpack, pushState, pullState, chooseOnStart, startCloudSync, type KV } from '../app/src/api/cloud';
import { saveState, loadState, setSaveListener } from '../app/src/game/local';
import { ENERGY } from '../app/src/game/config';
import { checkTyped, setDictionary } from '../app/src/engine/check';
import { noteTyping, typoAllowed, TYPO_LIMIT } from '../app/src/game/typos';
import { buildLesson, buildReview, buildTrial, tokenize } from '../app/src/engine/generators';
import { vocabOf, knownSentence } from '../app/src/engine/vocab';
import { canBuy } from '../app/src/game/shop';
import { ITEMS } from '../app/src/game/config';
import type { LevelPack } from '../app/src/types';

let fakeDay = 20000;
const RealDate = Date;
// @ts-ignore подмена «сегодня»
globalThis.Date = class extends RealDate {
  constructor(...a: any[]) { super(...(a.length ? a : [fakeDay * 86400000 + 12 * 3600000])); }
  static now() { return fakeDay * 86400000 + 12 * 3600000; }
  getTimezoneOffset() { return 0; }
};

let n = 0;
const t = async (name: string, fn: () => void | Promise<void>) => { await fn(); n++; console.log('✓', name); };

await t('проверка ввода', () => {
  assert.equal(checkTyped('Boarding Pass', ['boarding pass']), 'exact');
  assert.equal(checkTyped('the umbrella', ['umbrella']), 'exact');
  assert.equal(checkTyped('umbrela', ['umbrella']), 'typo');
  assert.equal(checkTyped('snw', ['snow']), 'typo');     // одна буква — прощаем и в коротких словах
  assert.equal(checkTyped('sn', ['snow']), 'wrong');
  assert.equal(checkTyped('', ['snow']), 'wrong');
  assert.equal(checkTyped('cafe', ['café']), 'exact');
  assert.equal(checkTyped('привет', ['привет']), 'exact');
  assert.notEqual(checkTyped('мой', ['мои']), 'exact'); // й не превращается в и
});

await t('интервалы: бесплатно 11 дней до закрепления, Premium 7', () => {
  for (const [premium, want] of [[false, 11], [true, 7]] as const) {
    let [m] = applyAnswer(undefined, true, 0, premium);
    let d = 0;
    while (m.s < 3) { d = m.due; [m] = applyAnswer(m, true, d, premium); }
    assert.equal(d, want);
    assert.equal(unlockGap(premium), want);
  }
});

await t('повтор в тот же день не ускоряет', () => {
  let [m] = applyAnswer(undefined, true, 0, false);
  for (let i = 0; i < 5; i++) [m] = applyAnswer(m, true, 0, false);
  assert.equal(m.s, 0);
});

await t('костёр: пропуск спасает только уголь, без угля серия сгорает', () => {
  const s = emptyState();
  const noGift = (d: number) => { s.emberWeek = Math.floor((d + 3) / 7); }; // отключаем недельный подарок
  bumpStreak(s, 100); bumpStreak(s, 101);
  assert.equal(s.streak.cur, 2);
  s.inventory.ember = 1;
  noGift(103); settleStreak(s, 103); // пропущен 102
  assert.equal(s.inventory.ember, 0);
  assert.equal(liveStreak(s, 103), 2);
  bumpStreak(s, 103);
  assert.equal(s.streak.cur, 3);
  noGift(105); settleStreak(s, 105); // пропущен 104, угля нет
  assert.equal(s.streak.cur, 0);
  assert.equal(liveStreak(s, 105), 0);
  assert.equal(bumpStreak(s, 105), true);
  assert.equal(s.streak.cur, 1);                    // начинается заново
  assert.equal(bumpStreak(s, 105), false);          // второе занятие в тот же день не растит серию
  s.inventory.ember = 2;
  noGift(108); settleStreak(s, 108);                // пропущено 2 дня — ушло 2 угля
  assert.equal(s.streak.cur, 1);
  assert.equal(s.inventory.ember, 0);
  const g = emptyState();
  settleStreak(g, 200);
  assert.equal(g.inventory.ember, 1); // недельный подарок
});

const pack = JSON.parse(readFileSync('app/public/content/a2.json', 'utf8')) as LevelPack;
const fake = pack;

await t('остров открывается только после закрепления 80% слов и паузы экспедиции', () => {
  const s = emptyState();
  s.premium = true; // остров 2 платный
  const isl2 = fake.islands[1];
  assert.equal(islandState(fake, isl2, s).kind, 'locked');
  for (const l of fake.lessons.filter((l) => l.island === 1)) s.done[l.id] = { best: 100, at: 0 };
  const words = fake.lessons.filter((l) => l.island === 1).flatMap((l) => l.words);
  const need = Math.ceil(words.length * 0.8);
  words.slice(0, need - 1).forEach((w) => (s.mem[w.id] = { s: 3, due: 0, seen: 4, wrong: 0 }));
  commitUnlocks(s, [fake]);
  assert.equal(islandState(fake, isl2, s).kind, 'locked'); // на одно слово меньше нормы
  s.mem[words[need - 1].id] = { s: 3, due: 0, seen: 4, wrong: 0 };
  commitUnlocks(s, [fake]);
  assert.equal(islandState(fake, isl2, s).kind, 'open');
  // второй архипелаг не открывается раньше паузы
  const other: LevelPack = { ...fake, level: 'B1' };
  commitUnlocks(s, [fake, other]);
  assert.equal(islandState(other, other.islands[1], s).kind, 'locked');
  fakeDay += unlockGap(true);
  commitUnlocks(s, [fake, other]);
  assert.equal(islandState(other, other.islands[1], s).kind, 'open');
});

await t('генератор: сначала карточки новых слов, каждое слово встречается, повторение строится', () => {
  const pool0 = pack.lessons.flatMap((l) => l.words);
  const packs = ['a1', 'a2', 'b1', 'b2'].map((l) => JSON.parse(readFileSync(`app/public/content/${l}.json`, 'utf8')) as LevelPack);
  for (const pk of packs) for (const l of pk.lessons) {
    const pool = pk.lessons.flatMap((x) => x.words);
    const ex = buildLesson(l, pool, 1);
    const seen = new Set(ex.filter((e) => e.kind !== 'learn').flatMap((e) => (e.kind === 'pairs' ? e.words : [e.word])).map((w) => w.id));
    l.words.forEach((w) => assert.ok(seen.has(w.id), w.en));
    ex.filter((e) => e.kind === 'choice').forEach((e) => e.kind === 'choice' && assert.equal(new Set(e.options).size, 4));
  }
  const l0 = pack.lessons[0];
  const fresh = buildLesson(l0, pool0, 1);
  assert.equal(fresh.filter((e) => e.kind === 'learn').length, l0.words.length); // все слова новые → карточки
  const firstChoice = fresh.findIndex((e) => e.kind === 'choice');
  assert.equal(fresh[0].kind, 'learn'); // сначала учим, потом проверяем
  assert.ok(firstChoice > 0);
  const again = buildLesson(l0, pool0, 1, new Set(l0.words.map((w) => w.id)));
  assert.equal(again.filter((e) => e.kind === 'learn').length, 0); // знакомые слова — без карточек
  const pool = pool0;
  assert.ok(buildReview(pool.slice(0, 12), pool, 1).length >= 12);
});

await t('пары: подписи по-русски не повторяются, у каждой — одно подходящее слово', () => {
  const packs = ['a1', 'a2', 'b1', 'b2'].map((l) => JSON.parse(readFileSync(`app/public/content/${l}.json`, 'utf8')) as LevelPack);
  const all = packs.flatMap((p) => p.lessons.flatMap((l) => l.words));
  for (const pk of packs) {
    const pool = pk.lessons.flatMap((x) => x.words);
    for (const l of pk.lessons) for (const seed of [1, 2, 3]) {
      for (const e of [...buildLesson(l, pool, seed), ...buildReview(l.words, all, seed)]) {
        if (e.kind !== 'pairs') continue;
        assert.equal(new Set(e.labels).size, e.labels.length, l.id);
        e.words.forEach((a, i) => e.words.forEach((b) => a !== b && assert.ok(!b.ru.includes(e.labels[i]), `${l.id}: ${a.en}/${b.en}`)));
      }
    }
  }
});

await t('ввод: синоним с тем же переводом засчитывается', () => {
  const a1 = JSON.parse(readFileSync('app/public/content/a1.json', 'utf8')) as LevelPack;
  const pool = a1.lessons.flatMap((l) => l.words);
  const begin = pool.find((w) => w.en === 'begin')!; // «начинать», как и start
  const ex = buildTrial([begin], pool, 1);
  assert.ok(ex[0].kind === 'type' && checkTyped('start', ex[0].answers) === 'exact');
});

await t('сборка предложения: без плиток-знаков и только из знакомых слов', () => {
  assert.deepEqual(tokenize('Thank you! — You\'re welcome.'), ['Thank', 'you', "You're", 'welcome']);
  const a1 = JSON.parse(readFileSync('app/public/content/a1.json', 'utf8')) as LevelPack;
  const pool = a1.lessons.flatMap((l) => l.words);
  let learned = [] as typeof pool;
  for (const l of a1.lessons) {
    const v = vocabOf([...learned, ...l.words]);
    for (const seed of [1, 2]) for (const e of buildLesson(l, pool, seed, new Set(learned.map((w) => w.id)), v)) {
      if (e.kind !== 'build') continue;
      assert.ok(knownSentence(e.answer, v), `${l.id}: ${e.answer}`);
      e.tokens.forEach((t) => assert.ok(knownSentence(t, v), `${l.id}: лишняя плитка ${t}`));
    }
    learned = [...learned, ...l.words];
  }
});

await t('урок: английские варианты ответа — только из пройденных слов', () => {
  const a1 = JSON.parse(readFileSync('app/public/content/a1.json', 'utf8')) as LevelPack;
  const pool = a1.lessons.flatMap((l) => l.words);
  const learned = new Set<string>();
  for (const l of a1.lessons) {
    const okEn = new Set(pool.filter((w) => learned.has(w.id) || l.words.includes(w)).map((w) => w.en));
    for (const seed of [1, 2, 3]) for (const e of buildLesson(l, pool, seed, learned)) {
      if (e.kind === 'choice' && e.dir === 'ru-en') e.options.forEach((o) => assert.ok(okEn.has(o), `${l.id}: «${o}» ещё не пройдено`));
    }
    l.words.forEach((w) => learned.add(w.id));
  }
});

await t('лавка: масло не продаётся, когда фонарь полон', () => {
  const s = emptyState();
  s.coins = 1000; s.energy = 10;
  assert.equal(canBuy(s, ITEMS.find((i) => i.id === 'oil')!), 'Фонарь и так полон');
});

await t('проверка контента: неизученные слова, повторы примеров, одинаковые переводы', () => {
  const ok = spawnSync('node', ['scripts/validate-content.mjs'], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const dir = mkdtempSync(join(tmpdir(), 'content-'));
  cpSync('content/levels', dir, { recursive: true });
  const f = join(dir, 'a1', 'lessons', 'day-02.json');
  const d = JSON.parse(readFileSync(f, 'utf8'));
  d.words[0].examples[0].en = 'Hello! I love pizza.';       // love и pizza ещё не изучены
  d.words[1].examples[0].en = d.words[2].examples[0].en;     // повтор примера
  d.words[5].ru = [...d.words[6].ru];                        // одинаковый перевод в уроке
  writeFileSync(f, JSON.stringify(d));
  const bad = spawnSync('node', ['scripts/validate-content.mjs'], { encoding: 'utf8', env: { ...process.env, CONTENT_DIR: dir } });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /неизученные слова: love, pizza/);
  assert.match(bad.stderr, /повторяет пример/);
  assert.match(bad.stderr, /совпадает со словом/);
});

await t('словарь: формы и простые окончания засчитываются, неправильные формы — только через forms', () => {
  const w = (en: string, forms?: string[]) => ({ id: en, en, ru: [en], pos: 'other', forms, examples: [] });
  const v = vocabOf([w('go', ['went']), w('cat'), w('he'), w('she'), w('the'), w('are'), w('a'), w('and')]);
  assert.ok(knownSentence('He goes, she went, the cats are going.', v));
  assert.ok(!knownSentence('Why are the cats here?', v)); // служебные слова тоже нужно пройти
  assert.ok(!knownSentence('He bought a cat.', v));
  assert.ok(knownSentence('Anna and Tom.', v)); // имена
});

await t('энергия: старт из shop.json, заряд возвращается за брошенный урок', () => {
  const s = emptyState();
  assert.equal(s.energy, ENERGY.max);
  assert.ok(spendEnergy(s));
  assert.equal(s.energy, ENERGY.max - ENERGY.lessonCost);
  refundEnergy(s);
  assert.equal(s.energy, ENERGY.max);
  const p = emptyState(); p.premium = true; p.energy = 0; refundEnergy(p);
  assert.equal(p.energy, 0); // у Premium энергия не считается
});

await t('что дальше: бесплатный игрок после двух островов не в тупике', () => {
  const a1 = JSON.parse(readFileSync('app/public/content/a1.json', 'utf8')) as LevelPack;
  const s = emptyState();
  assert.equal(nextSteps(a1, s).nextLesson?.day, 1);
  for (const l of a1.lessons.filter((l) => l.island <= 2)) s.done[l.id] = { best: 100, at: 0 };
  for (const w of a1.lessons.filter((l) => l.island <= 2).flatMap((l) => l.words)) s.mem[w.id] = { s: 3, due: 0, seen: 4, wrong: 0 };
  s.unlocks[`${a1.level}-2`] = 0;
  const steps = nextSteps(a1, s);
  assert.equal(steps.nextLesson, undefined);
  assert.equal(steps.blocked, 'premium');
  assert.equal(steps.trialIsland?.n, 2);
  s.premium = true;
  commitUnlocks(s, [a1]);
});

await t('часы: назад не идут, в Telegram при запуске не убегают вперёд, ночью идут', () => {
  resetClock();
  const t0 = nowMs();
  fakeDay -= 3;                                  // часы отвели на 3 дня назад
  assert.equal(nowMs(), t0);
  fakeDay += 3;
  fakeDay += 30;                                 // часы перевели на месяц вперёд и открыли приложение
  setTrustedStart(Math.floor(t0 / 1000));        // а Telegram подписал запуск «сейчас»
  assert.ok(nowMs() - t0 < 11 * 60000);
  fakeDay += 1;                                  // приложение свёрнуто на ночь, телефон спал
  assert.ok(nowMs() - t0 >= 86400000 - 11 * 60000, 'время идёт, пока телефон спит');
  fakeDay -= 31;
  resetClock();
});

await t('облако Telegram: прогресс целиком влезает в лимиты и восстанавливается', async () => {
  const store = new Map<string, string>();
  const kv: KV = {
    get: async (keys) => Object.fromEntries(keys.filter((k) => store.has(k)).map((k) => [k, store.get(k)!])),
    set: async (k, v) => { assert.ok(v.length <= 4096 && /^[A-Za-z0-9_-]{1,128}$/.test(k)); store.set(k, v); },
  };
  const s = emptyState();
  s.level = 'B1'; s.xp = 12345; s.updatedAt = 777;
  const packs2 = ['a1', 'a2', 'b1', 'b2'].map((l) => JSON.parse(readFileSync(`app/public/content/${l}.json`, 'utf8')) as LevelPack);
  for (const w of packs2.flatMap((p) => p.lessons.flatMap((l) => l.words))) s.mem[w.id] = { s: 3, due: 20100, seen: 7, wrong: 2 };
  assert.deepEqual(unpack(packState(s)).mem, s.mem);
  await pushState(kv, s);
  assert.ok(store.size < 1024);
  const back = await pullState(kv);
  assert.equal(back?.xp, 12345);
  assert.equal(Object.keys(back!.mem).length, Object.keys(s.mem).length);
  assert.equal(back?.updatedAt, 777);
  // вторая запись идёт в другой слот: недописанная копия не портит текущую
  s.xp = 1; s.updatedAt = 778;
  await pushState(kv, s);
  assert.equal((await pullState(kv))?.xp, 1);
  // выбор при запуске
  const empty = emptyState();
  assert.equal(chooseOnStart(empty, back), 'remote');          // новый телефон — берём облако
  const fresh = { ...back!, updatedAt: 999 };
  assert.equal(chooseOnStart(fresh, back), 'local');           // на телефоне новее
  assert.equal(chooseOnStart(fresh, null), 'local');
});

await t('покупки: ракушки начисляются один раз, возврат снимает, подписка и друзья', () => {
  const s = emptyState();
  const pack = STAR_PACKS[0];
  const st = { purchases: [{ id: 'c1', item: pack.id, at: 1 }], premiumUntil: 0, referrals: [] };
  assert.equal(applyStatus(s, st).coins, pack.coins);
  assert.equal(applyStatus(s, st).coins, 0);                         // повтор — без двойного начисления
  assert.equal(s.coins, pack.coins);
  s.coins -= 10;                                                     // часть потрачена
  applyStatus(s, { ...st, purchases: [{ id: 'c1', item: pack.id, at: 1, refunded: true }] });
  assert.equal(s.coins, 0);                                          // возврат: снято, но не ниже нуля
  applyStatus(s, { purchases: [], premiumUntil: 5_000_000_000_000, referrals: [] });
  assert.equal(s.premiumUntil, 5_000_000_000_000);
  const friends = Array.from({ length: REFERRAL.maxRewardedFriends + 3 }, (_, i) => ({ id: String(i), at: 1 }));
  const a = applyStatus(s, { purchases: [], premiumUntil: 0, referrals: friends });
  assert.equal(a.friends, REFERRAL.maxRewardedFriends);              // бонус не больше лимита друзей
  const g = emptyState();
  assert.equal(applyFriendGift(g), REFERRAL.friendCoins);
  assert.equal(applyFriendGift(g), 0);                               // подарок новичку — один раз
});

const BOT = '123456:TEST-token';
function mockEnv() {
  const kv = new Map<string, string>();
  const calls: { method: string; body: any }[] = [];
  const env: Env = { DB: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } }, BOT_TOKEN: BOT, WEBHOOK_SECRET: 'sec', APP_URL: 'https://x.pages.dev' };
  globalThis.fetch = (async (url: string, init: any) => {
    const method = String(url).split('/').pop()!;
    const body = JSON.parse(init.body);
    calls.push({ method, body });
    return new Response(JSON.stringify({ ok: true, result: method === 'createInvoiceLink' ? 'https://t.me/$invoice' : true }));
  }) as any;
  return { env, kv, calls };
}

await t('сервер: подпись Telegram проверяется, поддельные и старые данные отклоняются', async () => {
  const now = Math.floor(Date.now() / 1000);
  const init = await signInitData({ auth_date: String(now), user: JSON.stringify({ id: 42, first_name: 'A' }) }, BOT);
  assert.equal((await verifyInitData(init, BOT, now))?.id, 42);
  assert.equal(await verifyInitData(init, '999:other', now), null);                  // другой бот
  assert.equal(await verifyInitData(init.replace('42', '43'), BOT, now), null);       // подмена id
  assert.equal(await verifyInitData(init, BOT, now + 2 * 86400), null);               // устарело
});

await t('сервер: цена только из каталога, платёж записывается без дублей, возврат', async () => {
  const { env, kv, calls } = mockEnv();
  const now = Math.floor(Date.now() / 1000);
  const init = await signInitData({ auth_date: String(now), user: JSON.stringify({ id: 7 }) }, BOT);
  const pack = STAR_PACKS[1];
  const res = await worker.fetch(new Request('https://w/api/invoice', { method: 'POST', body: JSON.stringify({ initData: init, item: pack.id, stars: 1 }) }), env);
  assert.equal((await res.json() as any).link, 'https://t.me/$invoice');
  const inv = calls.find((c) => c.method === 'createInvoiceLink')!.body;
  assert.equal(inv.prices[0].amount, pack.stars);                    // клиентская «цена» 1 проигнорирована
  assert.equal(inv.currency, 'XTR');
  const bad = await worker.fetch(new Request('https://w/api/status', { method: 'POST', body: JSON.stringify({ initData: 'user=%7B%22id%22%3A7%7D&hash=00' }) }), env);
  assert.equal(bad.status, 401);
  // проверка перед оплатой: неверная сумма отклоняется
  const payload = JSON.stringify({ u: 7, i: pack.id });
  await handleUpdate(env, { pre_checkout_query: { id: 'q1', from: { id: 7 }, currency: 'XTR', total_amount: 1, invoice_payload: payload } });
  assert.equal(calls.at(-1)!.body.ok, false);
  await handleUpdate(env, { pre_checkout_query: { id: 'q2', from: { id: 7 }, currency: 'XTR', total_amount: pack.stars, invoice_payload: payload } });
  assert.equal(calls.at(-1)!.body.ok, true);
  const paid = { message: { chat: { id: 7 }, successful_payment: { currency: 'XTR', total_amount: pack.stars, invoice_payload: payload, telegram_payment_charge_id: 'ch1' } } };
  await handleUpdate(env, paid);
  await handleUpdate(env, paid);                                     // Telegram прислал повторно
  let st = await handleStatus(env, 7);
  assert.equal(st.purchases.length, 1);
  // подписка
  const sub = { message: { chat: { id: 7 }, successful_payment: { currency: 'XTR', total_amount: catalogItem('premium_month')!.stars, invoice_payload: JSON.stringify({ u: 7, i: 'premium_month' }), telegram_payment_charge_id: 'ch2', subscription_expiration_date: now + 30 * 86400 } } };
  await handleUpdate(env, sub);
  st = await handleStatus(env, 7);
  assert.equal(st.premiumUntil, (now + 30 * 86400) * 1000);
  await handleUpdate(env, { message: { chat: { id: 7 }, refunded_payment: { invoice_payload: JSON.stringify({ u: 7, i: 'premium_month' }), telegram_payment_charge_id: 'ch2' } } });
  st = await handleStatus(env, 7);
  assert.ok(st.premiumUntil <= Date.now());
  assert.ok(st.purchases.find((p) => p.id === 'ch2')!.refunded);
  // вебхук без секрета — отказ
  const hook = await worker.fetch(new Request('https://w/bot', { method: 'POST', body: '{}' }), env);
  assert.equal(hook.status, 403);
  assert.ok(kv.size > 0);
});

await t('сервер: бонус за друга — только новичку и не за самого себя', async () => {
  const { env } = mockEnv();
  assert.equal((await handleReferral(env, 5, 'ref_5')).ok, false);   // сам себя
  assert.equal((await handleReferral(env, 6, 'ref_5')).ok, true);    // новичок
  assert.equal((await handleReferral(env, 6, 'ref_5')).ok, false);   // второй раз
  await handleStatus(env, 8);                                        // игрок 8 уже играл
  assert.equal((await handleReferral(env, 8, 'ref_5')).ok, false);
  await handleStatus(env, 6); await handleStatus(env, 6);            // друг зашёл, но только в один день
  assert.equal((await handleStatus(env, 5)).referrals.length, 0);    // пригласившему пока ничего
  fakeDay += 1;
  await handleStatus(env, 6);                                        // второй день занятий
  assert.equal((await handleStatus(env, 5)).referrals.length, 1);
  // не больше 5 друзей, даже если пригласить 20 «аккаунтов»
  for (let id = 100; id < 120; id++) { await handleReferral(env, id, 'ref_5'); await handleStatus(env, id); }
  fakeDay += 1;
  for (let id = 100; id < 120; id++) await handleStatus(env, id);
  assert.equal((await handleStatus(env, 5)).referrals.length, REFERRAL.maxRewardedFriends);
  fakeDay -= 2;
});

await t('облако: не висит без ответа, записи не перемешиваются, последняя версия доходит', async () => {
  const mem = new Map<string, string>();
  (globalThis as any).localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, v), removeItem: (k: string) => mem.delete(k) };
  const RealST = globalThis.setTimeout;
  // облако, которое никогда не отвечает: запуск не должен зависнуть
  const dead: KV = { get: () => new Promise(() => {}), set: () => new Promise(() => {}) };
  assert.equal(await startCloudSync(dead, 20), false);
  // медленное облако: запись идёт долго, а игрок за это время сохраняет ещё дважды
  const store = new Map<string, string>();
  let writing = 0, maxParallel = 0;
  const slow: KV = {
    get: async (keys) => Object.fromEntries(keys.filter((k) => store.has(k)).map((k) => [k, store.get(k)!])),
    set: async (k, v) => { writing++; maxParallel = Math.max(maxParallel, writing); await new Promise((r) => RealST(r, 1500)); store.set(k, v); writing--; },
  };
  await startCloudSync(slow, 1000);
  const s = emptyState(); s.level = 'A1';
  s.xp = 1; saveState(s);
  await new Promise((r) => RealST(r, 2300));   // запись xp=1 уже идёт (каждый кусок ~1,5 с)
  s.xp = 2; saveState(s);                      // через 2 с захочется писать снова — во время записи
  await new Promise((r) => RealST(r, 9000));
  assert.equal(maxParallel, 1);
  assert.equal((await pullState(slow))?.xp, 2);
  setSaveListener(null);
});

await t('опечатки: одна буква прощается, но не в 1–2-буквенных словах, не другим словом и не больше 2 раз подряд', () => {
  setDictionary(['car', 'cat', 'go', 'do', 'house']);
  assert.equal(checkTyped('hous', ['house']), 'typo');
  assert.equal(checkTyped('cat', ['car']), 'wrong');          // это другое слово
  assert.equal(checkTyped('og', ['go']), 'wrong');            // слово из 2 букв — только точно
  assert.equal(checkTyped('hous', ['house'], false), 'wrong'); // лимит опечаток исчерпан
  const mem = new Map<string, string>();
  (globalThis as any).localStorage ??= { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => mem.set(k, v), removeItem: (k: string) => mem.delete(k) };
  saveState(emptyState());
  const id = 'a1-d01-01';
  for (let i = 0; i < TYPO_LIMIT; i++) { assert.ok(typoAllowed(loadState(), id)); noteTyping(id, 'typo'); }
  assert.ok(!typoAllowed(loadState(), id));                   // третья опечатка уже не засчитается
  noteTyping(id, 'exact');
  assert.ok(typoAllowed(loadState(), id));                    // написал точно — снова можно ошибиться на букву
  setDictionary([]);
});

await t('на слух: 2 задания в уроке со звуком, без звука — ни одного; ответы корректны', () => {
  const a1 = JSON.parse(readFileSync('app/public/content/a1.json', 'utf8')) as LevelPack;
  const pool = a1.lessons.flatMap((l) => l.words);
  for (const l of a1.lessons.slice(0, 20)) {
    const on = buildLesson(l, pool, 3, new Set(), undefined, true).filter((e) => e.kind === 'listen');
    assert.equal(on.length, 2, l.id);
    for (const e of on) if (e.kind === 'listen') {
      if (e.mode === 'choose') { assert.equal(new Set(e.options).size, 4); assert.ok(e.options.includes(e.answer)); }
      else assert.ok(e.answers.includes(e.word.en));
    }
    assert.equal(buildLesson(l, pool, 3).filter((e) => e.kind === 'listen').length, 0);
  }
  assert.ok(buildReview(pool.slice(0, 12), pool, 1, undefined, true).some((e) => e.kind === 'listen'));
});

console.log(`\n${n} проверок пройдено`);
