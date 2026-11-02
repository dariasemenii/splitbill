# Split

Застосунок для розподілу спільних витрат у групах.

## Вимоги

- Node.js 20.19+ (рекомендовано 22, див. `.nvmrc`)
- Docker (для локального Postgres)

## Перший запуск бекенду

```bash
npm install
npm run db:up                                  # Postgres у Docker
cp apps/api/.env.example apps/api/.env         # заповнити JWT_SECRET і OTP_SECRET
npm run db:migrate -- --name init              # створити таблиці
npm run dev:api                                # http://localhost:3000
```

Секрети можна згенерувати так: `openssl rand -base64 48`.

Поки `RESEND_API_KEY` порожній, коди входу виводяться в консоль сервера.

## API

| Метод | Шлях | Опис |
|---|---|---|
| GET | /api/health | перевірка сервера і бази |
| POST | /api/auth/email/request | надіслати код на email |
| POST | /api/auth/email/verify | перевірити код, отримати токени |
| POST | /api/auth/oauth | вхід через Google / Apple ID-токен |
| POST | /api/auth/refresh | оновити пару токенів |
| POST | /api/auth/logout | відкликати refresh-токен |
| GET, PATCH | /api/me | профіль |
| GET, POST | /api/groups | мої групи / створити групу |

Захищені запити: заголовок `Authorization: Bearer <accessToken>`.

### Швидка перевірка

```bash
curl -X POST localhost:3000/api/auth/email/request \
  -H "Content-Type: application/json" -d '{"email":"me@example.com"}'

# код з'явиться в консолі сервера
curl -X POST localhost:3000/api/auth/email/verify \
  -H "Content-Type: application/json" -d '{"email":"me@example.com","code":"123456"}'
```

## Корисні команди

- `npm run db:studio` — переглядати дані в браузері
- `npm run typecheck`, `npm run lint`
