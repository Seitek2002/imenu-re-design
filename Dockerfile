# ========================
# Build stage
# ========================
FROM node:24.11.1-bullseye AS build

# Рабочая директория
WORKDIR /app

# Копируем package.json и package-lock.json и ставим зависимости
COPY package*.json ./
RUN npm install

# Копируем весь проект
COPY . .

# Собираем Next.js
RUN npm run build

# ========================
# Production stage
# ========================
FROM node:24.11.1-bullseye AS production

WORKDIR /app

# Копируем из build stage
COPY --from=build /app ./

# Открываем порт
EXPOSE 3000

# Старт приложения
CMD ["npm", "run", "start"]