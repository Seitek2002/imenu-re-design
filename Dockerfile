# ========= Build image =========
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ========= Production image =========
FROM oven/bun:1 AS production

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000
CMD ["bun", "run", "start"]
