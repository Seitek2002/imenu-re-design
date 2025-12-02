# ========================
# Build stage
# ========================
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ========================
# Production stage
# ========================
FROM node:20 AS production

WORKDIR /app
COPY --from=build /app ./

EXPOSE 3000
CMD ["npm", "run", "start"]