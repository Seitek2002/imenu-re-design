# syntax=docker/dockerfile:1.4

# ========================
# Dependencies stage
# ========================
FROM node:20-alpine AS deps

# Устанавливаем зависимости для sharp и других нативных модулей
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    vips-dev

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Устанавливаем зависимости с поддержкой sharp для Alpine
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --include=optional; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# ========================
# Build stage
# ========================
FROM node:20-alpine AS builder

# Устанавливаем зависимости для сборки
RUN apk add --no-cache \
    libc6-compat \
    vips-dev

WORKDIR /app

# Копируем node_modules из deps
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходный код
COPY . .

# Отключаем телеметрию Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Переустанавливаем sharp для правильной платформы
RUN npm rebuild sharp

# Сборка приложения
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else npm run build; \
  fi

# ========================
# Production stage
# ========================
FROM node:20-alpine AS runner

# Устанавливаем runtime зависимости для sharp
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata \
    vips && \
    rm -rf /var/cache/apk/*

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Устанавливаем правильные разрешения
RUN mkdir -p /app/.next && \
    chown -R nextjs:nodejs /app

# Копируем public директорию
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Копируем standalone сборку
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Копируем статические файлы
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Переменные окружения для production
ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Метаданные
LABEL maintainer="your-email@example.com" \
      description="Next.js Production Application" \
      version="1.0"

# Используем dumb-init для правильной обработки сигналов
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Запускаем сервер
CMD ["node", "server.js"]