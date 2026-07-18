# Страховой Клуб — frontend

React + TypeScript + Vite + Tailwind (shadcn). Подключён к бэкенду
`InsurancePlatformPy-main` (FastAPI) через Vite-прокси `/api → http://127.0.0.1:8000`.

## Запуск локально

```bash
# 1. Бэкенд (см. InsurancePlatformPy-main/README.md)
cd ../InsurancePlatformPy-main && ./scripts/run-local.sh   # :8000

# 2. Фронтенд
cd frontend/app
npm install
npm run dev      # http://localhost:3000
```

## Флоу

1. **Регистрация/вход** — телефон + код из SMS + пароль. В dev-режиме код
   показывается прямо в модалке (эндпоинт `/api/v1/auth/debug-code/`).
   Для регистрации нужен реферальный код: `ROOT2026` (root-код из settings).
2. **Личный кабинет** — открывается после авторизации (JWT в localStorage).
3. **Чаты** (кабинет и виджет на лендинге):
   - отправка сообщений — `POST /api/v1/chats/{id}/messages/`
   - история с поллингом каждые 4–5 c
   - **удаление сообщений** — корзина у своих сообщений (hover), `DELETE …/messages/{id}/`
   - **шаблонные фразы** — кнопка ⚡ рядом с инпутом, `GET /api/v1/templates/`

## Сборка

```bash
npm run build    # tsc + vite build → dist/
```
