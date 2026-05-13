FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .
RUN bun prisma generate

EXPOSE 4002

CMD ["sh", "-c", "bun prisma migrate deploy && bun run src/main.ts"]
