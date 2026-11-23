# Сервер покупок (Cloudflare Workers, бесплатно)

Нужен только для оплаты Telegram Stars и бонусов за друзей. Прогресс игроков хранится у них и в облаке Telegram.

## Запуск (на последнем шаге, когда есть бот)

1. Зарегистрируйся на cloudflare.com (бесплатно).
2. В папке `worker`:
   ```
   npx wrangler login
   npx wrangler kv namespace create DB     # вставь выданный id в wrangler.toml
   npx wrangler secret put BOT_TOKEN       # токен от @BotFather
   npx wrangler secret put WEBHOOK_SECRET  # любая длинная случайная строка
   npx wrangler deploy                     # выдаст адрес вида https://ostrov-slov-api.<имя>.workers.dev
   ```
3. Настрой бота одной командой (вебхук, команды /start /paysupport /terms, кнопка меню, описание):
   ```
   curl -X POST -H "x-setup-secret: <WEBHOOK_SECRET>" <адрес>/setup
   ```
4. Собери приложение с адресом сервера и ссылкой на мини-приложение:
   ```
   VITE_API_URL=<адрес> VITE_APP_LINK=https://t.me/<бот>/<имя_приложения> npm run build
   ```

## Что умеет

- `POST /api/invoice` — счёт на оплату. Цена берётся только из `content/shop.json`.
- `POST /bot` — вебхук Telegram: проверка перед оплатой, запись платежа, возвраты, кнопка «Открыть игру» на /start.
- `POST /setup` — разовая настройка бота (заголовок `x-setup-secret` = WEBHOOK_SECRET).
- `POST /api/status` — подтверждённые покупки, срок подписки, приглашённые друзья.
- `POST /api/referral` — новичок пришёл по ссылке друга (бонус только новым игрокам, не самому себе).

Каждый запрос от приложения проверяется по подписи Telegram (`initData`).
