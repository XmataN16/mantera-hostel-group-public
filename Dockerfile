# Этап 1: Сборка
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Этап 2: Запуск SSR сервера
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist .
EXPOSE 4000
# Имя папки зависит от названия проекта в package.json
CMD ["node", "mantera-hostel-group-public/server/server.mjs"]