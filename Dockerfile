# ========================
# Build stage
# ========================
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package файлы для установки зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN npm ci --no-audit --no-fund

# Копируем исходный код
COPY . .

# Сборка Next.js приложения
# ВАЖНО: убедитесь что в next.config.js включен output: 'standalone'
RUN npm run build

# ========================
# Production stage  
# ========================
FROM node:20-alpine AS runner

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Устанавливаем только необходимые системные пакеты
RUN apk add --no-cache \
    dumb-init \
    curl && \
    rm -rf /var/cache/apk/*

# Копируем необходимые файлы из builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Копируем standalone сборку
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Копируем статические файлы
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Переменные окружения
ENV PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Используем dumb-init для корректной обработки сигналов
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Запускаем Next.js сервер
CMD ["node", "server.js"]