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
3. Подключи бота к серверу (подставь свои значения):
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<адрес>/bot&secret_token=<WEBHOOK_SECRET>&allowed_updates=["message","pre_checkout_query"]
   ```
4. Собери приложение с адресом сервера и ссылкой на мини-приложение:
   ```
   VITE_API_URL=<адрес> VITE_APP_LINK=https://t.me/<бот>/<имя_приложения> npm run build
   ```

## Что умеет

- `POST /api/invoice` — счёт на оплату. Цена берётся только из `content/shop.json`.
- `POST /bot` — вебхук Telegram: проверка перед оплатой, запись платежа, возвраты, кнопка «Открыть игру» на /start.
- `POST /api/status` — подтверждённые покупки, срок подписки, приглашённые друзья.
- `POST /api/referral` — новичок пришёл по ссылке друга (бонус только новым игрокам, не самому себе).

Каждый запрос от приложения проверяется по подписи Telegram (`initData`).
