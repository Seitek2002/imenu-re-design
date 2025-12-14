# ========================
# Build stage
# ========================
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Копируем только package файлы
COPY package.json package-lock.json* ./

# 2. Проверяем package-lock на целостность
RUN npm ci --only=production --no-audit --no-fund --ignore-scripts

# 3. Копируем исходники
COPY . .

# 4. Сборка
RUN npm run build

# ========================
# Production stage  
# ========================
FROM node:20-alpine AS runner

# Запрещаем запуск от root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Устанавливаем только необходимые системные пакеты
RUN apk add --no-cache curl dumb-init && \
    chown -R nextjs:nodejs /app

# Копируем из builder только необходимое
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Запускаем через dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Запускаем сервер
CMD ["node", "server.js"]