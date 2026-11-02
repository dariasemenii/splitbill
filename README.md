# Split

Застосунок для розподілу спільних витрат у групах.

## Структура

```
apps/
  api/        бекенд: Next.js 16 (route handlers), Prisma 7, PostgreSQL
  mobile/     мобільний застосунок: Expo SDK 58, React Native, Expo Router
packages/
  shared/     спільні Zod-схеми і типи API, які використовують обидва застосунки
```

## Вимоги

- Node.js 20.19+ (рекомендовано 22, див. `.nvmrc`)
- Docker (для локального Postgres)
- Xcode з iOS-симулятором та/або Android Studio з емулятором

## Перший запуск

Усі команди виконуються з кореня репозиторію.

```bash
npm install

# База і бекенд
npm run db:up                                  # Postgres у Docker
cp apps/api/.env.example apps/api/.env         # заповнити JWT_SECRET і OTP_SECRET
npm run db:migrate -- --name init              # створити таблиці
npm run dev:api                                # http://localhost:3000

# В іншому терміналі: мобільний застосунок
npm run dev:mobile                             # далі натисніть i (iOS) або a (Android)
```

Секрети можна згенерувати так: `openssl rand -base64 48`.

Поки `RESEND_API_KEY` порожній, коди входу виводяться в консоль бекенду: шукайте рядок `[dev] Код входу`.

Застосунок сам знаходить бекенд: у режимі розробки він бере IP комп'ютера, на якому запущено Metro, і порт 3000. Тому той самий код працює і в симуляторі, і на реальному телефоні в тій самій Wi-Fi мережі. Щоб вказати іншу адресу, задайте `EXPO_PUBLIC_API_URL` у `apps/mobile/.env`.

### Expo Go чи development build

На старті застосунок запускається в Expo Go. Коли знадобляться нативні бібліотеки, яких немає в Expo Go, перейдіть на development build:

```bash
npm run ios:build -w @split/mobile       # збирає і встановлює застосунок у симулятор
npm run android:build -w @split/mobile
```

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
| GET | /api/groups/:groupId | група з учасниками |

Захищені запити: заголовок `Authorization: Bearer <accessToken>`.

## Корисні команди

- `npm run typecheck`, `npm run lint` — для всіх пакетів
- `npm run db:studio` — переглядати дані в браузері
