# Split

Застосунок для розподілу спільних витрат у групах (поїздки, вечірки тощо).

## Структура
- `apps/api` — бекенд: Next.js 16 (лише route handlers), Prisma 7, PostgreSQL
- `apps/mobile` — (буде) Expo / React Native

## Правила
- Гроші завжди цілі числа в мінімальних одиницях (копійки). Ніякого float.
- Фінансові записи посилаються на `GroupMember`, не на `User`.
- Для кожної витрати: sum(payers.amount) == sum(shares.amount) == expense.amount.
- Валідація вхідних даних через Zod, помилки через `HttpError` і обгортку `route()`.
- Захищені ендпоінти отримують користувача через `requireUserId(req)`.
- Після зміни `prisma/schema.prisma`: `npm run db:migrate` (створює міграцію і генерує клієнт).
